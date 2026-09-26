import { prisma } from "../../lib/prisma";
import { sendEmail } from "../../lib/email";
import { contactUserSelect } from "../../lib/select";
import { refreshStaleSummaries } from "../review/reviewSummary.service";
import { aiConfigured } from "../../lib/anthropic";

const fmt = (d: Date | string) => new Date(d).toLocaleString();

// Called by the scheduler (cron-job.org) on an interval. Sends two kinds of
// reminders and marks each record so nobody is emailed twice.
const runReminders = async () => {
  const now = new Date();
  const in30 = new Date(now.getTime() + 30 * 60 * 1000);
  const in24h = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  let sessionReminders = 0;
  let assignmentReminders = 0;

  // ---- 1) Sessions starting within the next 30 minutes ----
  const bookings = await prisma.booking.findMany({
    where: {
      reminder_sent: false,
      booking_status: { not: "CANCELLED" },
      courseSlot: { start_time: { gt: now, lte: in30 } },
    },
    include: { student: { select: contactUserSelect }, courseSlot: true },
  });

  for (const b of bookings) {
    if (b.student?.email) {
      await sendEmail({
        to: b.student.email,
        subject: `Reminder: "${b.courseSlot.name}" starts soon`,
        text: `Hi ${b.student.name}, your session "${b.courseSlot.name}" starts at ${fmt(
          b.courseSlot.start_time,
        )}.`,
        html: `<div style="font-family: sans-serif;">
          <h2>TutorSpace 🎓</h2>
          <p>Hi ${b.student.name},</p>
          <p>Your session <b>${b.courseSlot.name}</b> starts at <b>${fmt(
            b.courseSlot.start_time,
          )}</b> — in about 30 minutes.</p>
        </div>`,
      });
    }
    await prisma.booking.update({
      where: { id: b.id },
      data: { reminder_sent: true },
    });
    sessionReminders++;
  }

  // ---- 2) Assignments due within the next 24 hours ----
  const assignments = await prisma.assignment.findMany({
    where: { reminder_sent: false, due_date: { gt: now, lte: in24h } },
    include: { course: true },
  });

  for (const a of assignments) {
    // Students who have booked a slot in this course.
    const courseBookings = await prisma.booking.findMany({
      where: {
        courseSlot: { course_id: a.course_id },
        booking_status: { not: "CANCELLED" },
      },
      select: {
        student_id: true,
        student: { select: { name: true, email: true } },
      },
    });

    // Students who already submitted — they don't need a reminder.
    const submissions = await prisma.submission.findMany({
      where: { assignment_id: a.id },
      select: { student_id: true },
    });
    const submitted = new Set(submissions.map((s) => s.student_id));

    const emailed = new Set<string>();
    for (const cb of courseBookings) {
      if (submitted.has(cb.student_id) || emailed.has(cb.student_id)) continue;
      emailed.add(cb.student_id);
      if (cb.student?.email) {
        await sendEmail({
          to: cb.student.email,
          subject: `Reminder: "${a.title}" is due soon`,
          text: `Hi ${cb.student.name}, your assignment "${a.title}" is due ${
            a.due_date ? fmt(a.due_date) : "soon"
          }.`,
          html: `<div style="font-family: sans-serif;">
            <h2>TutorSpace 🎓</h2>
            <p>Hi ${cb.student.name},</p>
            <p>Your assignment <b>${a.title}</b> for <b>${
              a.course?.name ?? "your course"
            }</b> is due <b>${a.due_date ? fmt(a.due_date) : "soon"}</b>.</p>
            <p>You haven't submitted it yet — don't forget!</p>
          </div>`,
        });
      }
    }

    await prisma.assignment.update({
      where: { id: a.id },
      data: { reminder_sent: true },
    });
    assignmentReminders++;
  }

  // ---- 3) Refresh stale AI review summaries ----
  // Runs here rather than on a profile view so a public page never waits on a
  // model call. Wrapped because a summarisation failure must not stop the run
  // reporting the reminders it already sent.
  let reviewSummaries: { considered: number; updated: number; failed: number } | null = null;
  if (aiConfigured()) {
    try {
      reviewSummaries = await refreshStaleSummaries();
    } catch (error) {
      console.error("Review summary refresh failed:", error);
    }
  }

  return { sessionReminders, assignmentReminders, reviewSummaries };
};

export const ReminderService = { runReminders };
