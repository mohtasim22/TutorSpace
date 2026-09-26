// Zod 4 (shipped inside zod 3.25 at this subpath) — the SDK's zodOutputFormat
// helper is typed against v4. The rest of the codebase stays on the v3 entry
// point, which is what `validateRequest` and every *.validation.ts file use.
import { z } from "zod/v4";
import { prisma } from "../../lib/prisma";
import { pick } from "../../lib/pick";
import { anthropic, aiConfigured, MODEL } from "../../lib/anthropic";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

/**
 * Practice questions generated from a course material.
 *
 * The central rule is that a generated set is NOT published. The tutor reads
 * it, edits whatever is wrong, and publishes it deliberately; students only
 * ever see published sets. The model drafts, the tutor decides — nothing
 * generated reaches a student unread.
 */

/** Largest material we will send. Keeps us well inside the request limit. */
const MAX_FILE_BYTES = 10 * 1024 * 1024;

/** Per-tutor ceiling on generations per hour. */
const HOURLY_GENERATION_LIMIT = 10;

const QUESTION_COUNT = 8;

const QuestionSchema = z.object({
  type: z.enum(["mcq", "short_answer"]),
  question: z.string(),
  /** Four choices for an mcq; empty for a short answer. */
  options: z.array(z.string()),
  answer: z.string(),
  explanation: z.string(),
});

const PracticeSetSchema = z.object({
  title: z.string().describe("A short title naming the topic covered."),
  questions: z.array(QuestionSchema),
});

export type PracticeQuestion = z.infer<typeof QuestionSchema>;

const SYSTEM = `You write practice questions from a tutor's own course material, for their students to revise with.

Rules:
- Every question must be answerable from the supplied material alone. Do not draw on outside knowledge.
- Cover different parts of the material rather than clustering on one section.
- Mix recall and application. Questions that only ask for a definition make weak practice.
- For "mcq", give exactly four options, with exactly one correct. Wrong options must be plausible, not filler.
- For "short_answer", leave options empty and make the expected answer specific enough to mark.
- The explanation says why the answer is right, in one or two sentences, grounded in the material.
- If the material is too short or too thin to support ${QUESTION_COUNT} good questions, return fewer rather than padding.`;

const getTutorProfileOrThrow = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId },
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return tutorProfile;
};

/**
 * Fetch the material and turn it into a content block Claude can read.
 *
 * Materials live on Cloudinary, so the server downloads the file rather than
 * passing a URL through — that also lets us enforce a size ceiling before
 * anything is sent.
 */
const buildSourceBlock = async (fileUrl: string, title: string) => {
  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error("Could not download the material file");

  const contentType = (res.headers.get("content-type") || "").split(";")[0]!.trim();
  const buffer = Buffer.from(await res.arrayBuffer());

  if (buffer.byteLength > MAX_FILE_BYTES) {
    throw new Error(
      `This material is too large to generate from (limit ${MAX_FILE_BYTES / 1024 / 1024}MB)`,
    );
  }

  if (contentType === "application/pdf" || fileUrl.toLowerCase().endsWith(".pdf")) {
    return {
      type: "document" as const,
      source: {
        type: "base64" as const,
        media_type: "application/pdf" as const,
        data: buffer.toString("base64"),
      },
      title,
    };
  }

  const IMAGE_TYPES = ["image/png", "image/jpeg", "image/gif", "image/webp"] as const;
  type ImageType = (typeof IMAGE_TYPES)[number];
  if (IMAGE_TYPES.includes(contentType as ImageType)) {
    return {
      type: "image" as const,
      source: {
        type: "base64" as const,
        media_type: contentType as ImageType,
        data: buffer.toString("base64"),
      },
    };
  }

  if (contentType.startsWith("text/") || /\.(txt|md|csv)$/i.test(fileUrl)) {
    return { type: "text" as const, text: buffer.toString("utf-8").slice(0, 200_000) };
  }

  throw new Error(
    "Practice questions can only be generated from a PDF, an image, or a text file",
  );
};

/**
 * Generate a draft set from one of the tutor's own materials and store it
 * unpublished.
 */
const generateFromMaterial = async (materialId: string, userId: string) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);

  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
    include: { course: { select: { id: true, tutor_id: true, name: true } } },
  });
  if (!material) throw new Error("Material not found");
  if (material.course.tutor_id !== tutorProfile.id) {
    throw new Error("Forbidden! You can only generate from your own materials");
  }

  // After the ownership check, so an unauthorised caller is refused without
  // being told anything about how the server is configured — but before the
  // file download below, so a missing key doesn't cost a wasted transfer.
  if (!aiConfigured()) {
    throw new Error("AI features are not configured (missing ANTHROPIC_API_KEY)");
  }

  // Rate limit by counting rows rather than holding state in memory: the API
  // runs serverless, so one process's counter says nothing about the next
  // invocation's. A query is the only limiter that actually holds there.
  const recent = await prisma.practiceSet.count({
    where: {
      tutor_id: tutorProfile.id,
      createdAt: { gt: new Date(Date.now() - 60 * 60 * 1000) },
    },
  });
  if (recent >= HOURLY_GENERATION_LIMIT) {
    throw new Error(
      `You have reached the limit of ${HOURLY_GENERATION_LIMIT} generations per hour. Try again later.`,
    );
  }

  const sourceBlock = await buildSourceBlock(material.file_url, material.title);

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 8000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          sourceBlock,
          {
            type: "text",
            text: `Write up to ${QUESTION_COUNT} practice questions from this material ("${material.title}", from the course "${material.course.name}").`,
          },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(PracticeSetSchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed || !parsed.questions.length) {
    throw new Error("Could not generate questions from this material");
  }

  return prisma.practiceSet.create({
    data: {
      title: parsed.title || `Practice — ${material.title}`,
      questions: parsed.questions,
      course_id: material.course.id,
      material_id: material.id,
      tutor_id: tutorProfile.id,
      is_published: false,
    },
    include: { course: { select: { name: true } } },
  });
};

/**
 * Role-aware list, mirroring `getMaterials`: a tutor sees all of their own
 * sets including unpublished drafts; a student sees only published sets for
 * courses they have booked into.
 */
const getPracticeSets = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");

  if (user.role === "TUTOR") {
    const tutorProfile = await getTutorProfileOrThrow(userId);
    return prisma.practiceSet.findMany({
      where: { tutor_id: tutorProfile.id },
      include: {
        course: { select: { name: true } },
        material: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "STUDENT") {
    const bookings = await prisma.booking.findMany({
      where: { student_id: userId, booking_status: { not: "CANCELLED" } },
      include: { courseSlot: { select: { course_id: true } } },
    });
    const courseIds = [...new Set(bookings.map((b) => b.courseSlot.course_id))];

    return prisma.practiceSet.findMany({
      where: { course_id: { in: courseIds }, is_published: true },
      include: {
        course: { select: { name: true } },
        material: { select: { title: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ADMIN
  return prisma.practiceSet.findMany({
    include: {
      course: { select: { name: true } },
      material: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });
};

const ownedSetOrThrow = async (id: string, userId: string) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);
  const set = await prisma.practiceSet.findUnique({ where: { id } });
  if (!set) throw new Error("Practice set not found");
  if (set.tutor_id !== tutorProfile.id) {
    throw new Error("Forbidden! Not your practice set");
  }
  return set;
};

/** Tutor edits the draft — title, the questions themselves, or publish state. */
const updatePracticeSet = async (id: string, userId: string, payload: unknown) => {
  await ownedSetOrThrow(id, userId);

  const data = pick<{ title?: string; questions?: unknown; is_published?: boolean }>(
    payload,
    ["title", "questions", "is_published"],
  );

  if (data.questions !== undefined && !Array.isArray(data.questions)) {
    throw new Error("Questions must be a list");
  }

  return prisma.practiceSet.update({
    where: { id },
    data: data as never,
    include: { course: { select: { name: true } } },
  });
};

const deletePracticeSet = async (id: string, userId: string) => {
  await ownedSetOrThrow(id, userId);
  return prisma.practiceSet.delete({ where: { id } });
};

export const PracticeService = {
  generateFromMaterial,
  getPracticeSets,
  updatePracticeSet,
  deletePracticeSet,
};
