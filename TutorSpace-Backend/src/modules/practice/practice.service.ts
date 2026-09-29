// Zod 4 (shipped inside zod 3.25 at this subpath) — the SDK's zodOutputFormat
// helper is typed against v4. The rest of the codebase stays on the v3 entry
// point, which is what `validateRequest` and every *.validation.ts file use.
import { z } from "zod/v4";
import { prisma } from "../../lib/prisma";
import { pick } from "../../lib/pick";
import { anthropic, aiConfigured, MODEL } from "../../lib/anthropic";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { pdfSourceBlock, resolveMaterialAccess } from "../../lib/materialAccess";

/**
 * Practice quizzes generated from a course material (PDF).
 *
 * Two kinds of set come out of the same generator:
 *
 * - A STUDENT generates a quiz for their own revision. It is private to them
 *   and is labelled in the UI as AI-generated and not reviewed by the tutor.
 * - A TUTOR generates a set for the whole course. It starts unpublished; the
 *   tutor reads and edits it, then publishes it to every student in the course.
 *
 * In both cases the model is told to use the supplied PDF alone, and every
 * answer carries an explanation drawn from it, so a student can check the
 * answer against the source rather than trusting it.
 */

/** Per-user ceiling on generations per hour. */
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

const SYSTEM = `You write practice quiz questions from a tutor's course material, for students to revise with.

Rules:
- Every question must be answerable from the supplied material alone. Do not draw on outside knowledge.
- Cover different parts of the material rather than clustering on one section.
- Mix recall and application. Questions that only ask for a definition make weak practice.
- Prefer "mcq". For "mcq", give exactly four options, with exactly one correct, and make "answer" the exact text of the correct option. Wrong options must be plausible, not filler.
- For "short_answer", leave options empty and make the expected answer specific enough to mark.
- The explanation says why the answer is right, in one or two sentences, and points to where in the material it comes from.
- If the material is too short or too thin to support ${QUESTION_COUNT} good questions, return fewer rather than padding.`;

const setInclude = {
  course: { select: { name: true } },
  material: { select: { title: true } },
} as const;

/**
 * Generate a quiz from one PDF material.
 *
 * Checks run in a fixed order: access first, so an unauthorised caller learns
 * nothing about the server; then configuration; then the rate limit; and only
 * then the download and the paid model call.
 */
const generateFromMaterial = async (materialId: string, userId: string) => {
  const { material, role } = await resolveMaterialAccess(materialId, userId);
  if (role === "ADMIN") throw new Error("Only students and tutors can generate quizzes");

  if (!aiConfigured()) {
    throw new Error("AI features are not configured (missing ANTHROPIC_API_KEY)");
  }

  const isStudent = role === "STUDENT";

  // Rate limit by counting rows rather than holding state in memory: the API
  // runs serverless, so one process's counter says nothing about the next
  // invocation's. A query is the only limiter that actually holds there.
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const recent = await prisma.practiceSet.count({
    where: isStudent
      ? { student_id: userId, createdAt: { gt: since } }
      : { tutor_id: material.course.tutor_id, student_id: null, createdAt: { gt: since } },
  });
  if (recent >= HOURLY_GENERATION_LIMIT) {
    throw new Error(
      `You have reached the limit of ${HOURLY_GENERATION_LIMIT} quizzes per hour. Try again later.`,
    );
  }

  const sourceBlock = await pdfSourceBlock(material.file_url, material.title);

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
      tutor_id: material.course.tutor_id,
      student_id: isStudent ? userId : null,
      is_published: false,
    },
    include: setInclude,
  });
};

/**
 * Role-aware list.
 *
 * - Tutor: the sets they made for their courses, drafts included. Students'
 *   private quizzes are not shown — they are the student's own revision.
 * - Student: their own quizzes, plus sets their tutors have published for
 *   courses they are booked into.
 * - Admin: everything.
 */
const getPracticeSets = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");

  if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId },
    });
    if (!tutorProfile) throw new Error("Tutor profile not found");
    return prisma.practiceSet.findMany({
      where: { tutor_id: tutorProfile.id, student_id: null },
      include: setInclude,
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
      where: {
        OR: [
          { student_id: userId },
          { student_id: null, course_id: { in: courseIds }, is_published: true },
        ],
      },
      include: setInclude,
      orderBy: { createdAt: "desc" },
    });
  }

  // ADMIN
  return prisma.practiceSet.findMany({ include: setInclude, orderBy: { createdAt: "desc" } });
};

/** A tutor may change only the course sets they made, never a student's quiz. */
const tutorSetOrThrow = async (id: string, userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({ where: { user_id: userId } });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  const set = await prisma.practiceSet.findUnique({ where: { id } });
  if (!set) throw new Error("Practice set not found");
  if (set.tutor_id !== tutorProfile.id || set.student_id !== null) {
    throw new Error("Forbidden! Not your practice set");
  }
  return set;
};

/** Tutor edits the draft — title, the questions themselves, or publish state. */
const updatePracticeSet = async (id: string, userId: string, payload: unknown) => {
  await tutorSetOrThrow(id, userId);

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
    include: setInclude,
  });
};

/** A tutor deletes their course set; a student deletes their own quiz. */
const deletePracticeSet = async (id: string, userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId }, select: { role: true } });
  if (user?.role === "STUDENT") {
    const set = await prisma.practiceSet.findUnique({ where: { id } });
    if (!set) throw new Error("Practice set not found");
    if (set.student_id !== userId) throw new Error("Forbidden! Not your quiz");
  } else {
    await tutorSetOrThrow(id, userId);
  }
  return prisma.practiceSet.delete({ where: { id } });
};

export const PracticeService = {
  generateFromMaterial,
  getPracticeSets,
  updatePracticeSet,
  deletePracticeSet,
};
