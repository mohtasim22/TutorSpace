import { prisma } from "./prisma";

/**
 * Shared rules for the two AI features that work on a course material —
 * practice quizzes and summaries. Both need the same two answers: may this
 * person use this material, and what does the model actually read?
 */

/** Largest PDF we will send. Keeps us well inside the request limit. */
export const MAX_MATERIAL_BYTES = 10 * 1024 * 1024;

/** Only PDFs are read by the AI features; other uploads are download-only. */
export const isPdfMaterial = (fileUrl: string) =>
  /\.pdf($|\?)/i.test(fileUrl);

/**
 * Resolve whether `userId` may use `materialId` with the AI features.
 *
 * - The course's own tutor always may.
 * - A student may only if they hold a PAID, non-cancelled booking in that
 *   course. Generation costs money per call, so this is the same bar as
 *   joining a live session rather than the looser "has any booking" used for
 *   simply listing materials.
 * - Admins may read, which covers viewing a cached summary.
 *
 * Throws with a message the client can show as-is.
 */
export const resolveMaterialAccess = async (materialId: string, userId: string) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, role: true, status: true },
  });
  if (!user || user.status !== "ACTIVE") throw new Error("Unauthorized!");

  const material = await prisma.courseMaterial.findUnique({
    where: { id: materialId },
    include: { course: { select: { id: true, name: true, tutor_id: true } } },
  });
  if (!material) throw new Error("Material not found");

  if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    if (!tutorProfile || tutorProfile.id !== material.course.tutor_id) {
      throw new Error("Forbidden! This is not your material");
    }
    return { material, role: user.role, isOwner: true };
  }

  if (user.role === "STUDENT") {
    const booking = await prisma.booking.findFirst({
      where: {
        student_id: userId,
        courseSlot: { course_id: material.course.id },
        booking_status: { not: "CANCELLED" },
        payment_status: "PAID",
      },
      select: { id: true },
    });
    if (!booking) {
      throw new Error("You need a paid booking in this course to use its materials");
    }
    return { material, role: user.role, isOwner: false };
  }

  if (user.role === "ADMIN") {
    return { material, role: user.role, isOwner: false };
  }

  throw new Error("Unauthorized!");
};

/**
 * Download the material and turn it into a document block Claude can read.
 *
 * The server downloads the file rather than passing its URL through, which
 * lets the size ceiling be enforced before anything is sent.
 */
export const pdfSourceBlock = async (fileUrl: string, title: string) => {
  if (!isPdfMaterial(fileUrl)) {
    throw new Error("Only PDF materials can be summarised or turned into a quiz");
  }

  const res = await fetch(fileUrl);
  if (!res.ok) throw new Error("Could not download the material file");

  const buffer = Buffer.from(await res.arrayBuffer());
  if (buffer.byteLength > MAX_MATERIAL_BYTES) {
    throw new Error(
      `This PDF is too large (limit ${MAX_MATERIAL_BYTES / 1024 / 1024}MB)`,
    );
  }

  return {
    type: "document" as const,
    source: {
      type: "base64" as const,
      media_type: "application/pdf" as const,
      data: buffer.toString("base64"),
    },
    title,
  };
};
