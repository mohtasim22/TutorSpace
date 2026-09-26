import { prisma } from "../../lib/prisma";
import { notify } from "../../lib/notify";

// Resolve the TutorProfile for a logged-in tutor user, or throw.
const getTutorProfileOrThrow = async (userId: string) => {
  const tutorProfile = await prisma.tutorProfile.findUnique({
    where: { user_id: userId },
  });
  if (!tutorProfile) throw new Error("Tutor profile not found");
  return tutorProfile;
};

// TUTOR creates an assignment for one of their courses.
const createAssignment = async (
  payload: {
    title: string;
    description: string;
    due_date?: string | null;
    course_id: string;
  },
  userId: string,
) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);

  // Make sure the course actually belongs to this tutor.
  const course = await prisma.course.findUnique({
    where: { id: payload.course_id },
  });
  if (!course || course.tutor_id !== tutorProfile.id) {
    throw new Error("You can only add assignments to your own courses");
  }

  const created = await prisma.assignment.create({
    data: {
      title: payload.title,
      description: payload.description,
      due_date: payload.due_date ? new Date(payload.due_date) : null,
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
    `New assignment: ${created.title}`,
    "/dashboard/assignments",
  );

  return created;
};

// Role-aware list. Tutor sees their assignments (with a submission count);
// a student sees assignments for courses they have booked, each with their
// own submission (so the UI can show their grade / status).
const getAssignments = async (userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");

  if (user.role === "TUTOR") {
    const tutorProfile = await getTutorProfileOrThrow(userId);
    return prisma.assignment.findMany({
      where: { tutor_id: tutorProfile.id },
      include: {
        course: true,
        _count: { select: { submissions: true } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  if (user.role === "STUDENT") {
    // Which courses is this student connected to? Any course they've booked
    // a slot in.
    const bookings = await prisma.booking.findMany({
      where: { student_id: userId },
      include: { courseSlot: { select: { course_id: true } } },
    });
    const courseIds = [
      ...new Set(bookings.map((b) => b.courseSlot.course_id)),
    ];

    return prisma.assignment.findMany({
      where: { course_id: { in: courseIds } },
      include: {
        course: true,
        tutor: { select: { display_name: true } },
        // Only THIS student's submission for each assignment.
        submissions: { where: { student_id: userId } },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  // ADMIN
  return prisma.assignment.findMany({
    include: { course: true, _count: { select: { submissions: true } } },
    orderBy: { createdAt: "desc" },
  });
};

// TUTOR opens one assignment to see every student's submission.
const getAssignmentById = async (assignmentId: string, userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("Unauthorized!");

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
    include: {
      course: true,
      submissions: {
        include: { student: { select: { name: true, email: true } } },
        orderBy: { submittedAt: "desc" },
      },
    },
  });
  if (!assignment) throw new Error("Assignment not found");

  // Only the owning tutor (or an admin) may view all submissions.
  if (user.role !== "ADMIN") {
    const tutorProfile = await getTutorProfileOrThrow(userId);
    if (assignment.tutor_id !== tutorProfile.id) {
      throw new Error("Unauthorized! Not your assignment");
    }
  }

  return assignment;
};

// STUDENT submits (or re-submits) their work. `upsert` on the unique
// (assignment_id, student_id) pair means a second submit updates the first
// instead of creating a duplicate.
const submitAssignment = async (
  assignmentId: string,
  payload: { file_url: string; note?: string },
  userId: string,
) => {
  if (!payload.file_url) throw new Error("A file is required to submit");

  const assignment = await prisma.assignment.findUnique({
    where: { id: assignmentId },
  });
  if (!assignment) throw new Error("Assignment not found");

  // The student must actually be entitled to this assignment — that is, hold a
  // non-cancelled booking for a slot in its course. Entitlement is derived the
  // same way it is for listing (booking → slot → course). Without this check,
  // any authenticated student who knew an assignment id could submit work to
  // another tutor's course.
  const entitled = await prisma.booking.findFirst({
    where: {
      student_id: userId,
      booking_status: { not: "CANCELLED" },
      courseSlot: { course_id: assignment.course_id },
    },
    select: { id: true },
  });
  if (!entitled) {
    throw new Error("You have not booked a session in this course");
  }

  return prisma.submission.upsert({
    where: {
      assignment_id_student_id: {
        assignment_id: assignmentId,
        student_id: userId,
      },
    },
    update: {
      file_url: payload.file_url,
      note: payload.note ?? null,
      status: "SUBMITTED",
    },
    create: {
      assignment_id: assignmentId,
      student_id: userId,
      file_url: payload.file_url,
      note: payload.note ?? null,
    },
  });
};

// TUTOR grades a submission (marks + feedback).
const gradeSubmission = async (
  submissionId: string,
  payload: { grade: number; feedback?: string },
  userId: string,
) => {
  const tutorProfile = await getTutorProfileOrThrow(userId);

  const submission = await prisma.submission.findUnique({
    where: { id: submissionId },
    include: { assignment: true },
  });
  if (!submission) throw new Error("Submission not found");
  if (submission.assignment.tutor_id !== tutorProfile.id) {
    throw new Error("Unauthorized! You can only grade your own assignments");
  }

  const updated = await prisma.submission.update({
    where: { id: submissionId },
    data: {
      grade: payload.grade,
      feedback: payload.feedback ?? null,
      status: "GRADED",
    },
  });

  await notify(
    [submission.student_id],
    `Your submission for "${submission.assignment.title}" was graded`,
    "/dashboard/assignments",
  );

  return updated;
};

export const AssignmentService = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  submitAssignment,
  gradeSubmission,
};
