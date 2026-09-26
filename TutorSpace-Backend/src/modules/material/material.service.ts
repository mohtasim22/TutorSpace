import { prisma } from "../../lib/prisma";

const getTutorProfileOrThrow = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId },
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return tutorProfile;
};

// TUTOR uploads a material (the file itself is already on Cloudinary; we only
// store its URL) against one of their own courses.
const createMaterial = async (
  payload: { title: string; file_url: string; course_id: string },
  userId: string,
) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);

  if (!payload.file_url) throw new Error("A file is required");

  const course = await prisma.course.findUnique({
    where: { id: payload.course_id },
  });
  if (!course || course.tutor_id !== tutorProfile.id) {
    throw new Error("You can only add materials to your own courses");
  }

  return prisma.courseMaterial.create({
    data: {
      title: payload.title,
      file_url: payload.file_url,
      course_id: payload.course_id,
      tutor_id: tutorProfile.id,
    },
    include: { course: true },
  });
};

// Role-aware list. Tutor sees materials for their courses; a student sees
// materials for any course they've booked a slot in.
const getMaterials = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");

  if (user.role === "TUTOR") {
    const tutorProfile = await getTutorProfileOrThrow(userId);
    return prisma.courseMaterial.findMany({
      where: { tutor_id: tutorProfile.id },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "STUDENT") {
    const bookings = await prisma.booking.findMany({
      where: { student_id: userId },
      include: { courseSlot: { select: { course_id: true } } },
    });
    const courseIds = [...new Set(bookings.map((b) => b.courseSlot.course_id))];

    return prisma.courseMaterial.findMany({
      where: { course_id: { in: courseIds } },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ADMIN
  return prisma.courseMaterial.findMany({
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });
};

// TUTOR removes one of their materials.
const deleteMaterial = async (id: string, userId: string) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);

  const material = await prisma.courseMaterial.findUnique({ where: { id } });
  if (!material) throw new Error("Material not found");
  if (material.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! Not your material");
  }

  return prisma.courseMaterial.delete({ where: { id } });
};

export const MaterialService = {
  createMaterial,
  getMaterials,
  deleteMaterial,
};
