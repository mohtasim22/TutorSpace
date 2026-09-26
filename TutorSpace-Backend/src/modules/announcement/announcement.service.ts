import { prisma } from "../../lib/prisma";
import { notify } from "../../lib/notify";

const getTutorProfileOrThrow = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId },
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return tutorProfile;
};

// TUTOR posts a short announcement to one of their own courses.
const createAnnouncement = async (
  payload: { message: string; course_id: string },
  userId: string,
) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);

  if (!payload.message?.trim()) throw new Error("A message is required");

  const course = await prisma.course.findUnique({
    where: { id: payload.course_id },
  });
  if (!course || course.tutor_id !== tutorProfile.id) {
    throw new Error("You can only post announcements to your own courses");
  }

  const created = await prisma.announcement.create({
    data: {
      message: payload.message.trim(),
      course_id: payload.course_id,
      tutor_id: tutorProfile.id,
    },
    include: { course: true },
  });

  // Notify every student booked into this course.
  const bookings = await prisma.booking.findMany({
    where: {
      courseSlot: { course_id: payload.course_id },
      booking_status: { not: "CANCELLED" },
    },
    select: { student_id: true },
  });
  await notify(
    bookings.map((b) => b.student_id),
    `New announcement in ${created.course?.name ?? "your course"}`,
    "/dashboard/announcements",
  );

  return created;
};

// Role-aware feed (newest first). Tutor -> their courses; student -> booked.
const getAnnouncements = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");

  if (user.role === "TUTOR") {
    const tutorProfile = await getTutorProfileOrThrow(userId);
    return prisma.announcement.findMany({
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

    return prisma.announcement.findMany({
      where: { course_id: { in: courseIds } },
      include: { course: true },
      orderBy: { createdAt: "desc" },
    });
  }

  // ADMIN
  return prisma.announcement.findMany({
    include: { course: true },
    orderBy: { createdAt: "desc" },
  });
};

// TUTOR removes one of their announcements.
const deleteAnnouncement = async (id: string, userId: string) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);

  const announcement = await prisma.announcement.findUnique({ where: { id } });
  if (!announcement) throw new Error("Announcement not found");
  if (announcement.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! Not your announcement");
  }

  return prisma.announcement.delete({ where: { id } });
};

export const AnnouncementService = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
};
