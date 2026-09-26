
import { prisma } from "../../lib/prisma";
import { pick } from "../../lib/pick";
import { privateUserSelect } from "../../lib/select";
import { notify } from "../../lib/notify";
import { PaymentService } from "../payment/payment.service";

const BOOKING_STATUSES = ["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"] as const;
type BookingStatusValue = (typeof BOOKING_STATUSES)[number];

const createBookingIntoDB = async (
  payload: {
    course_slot_id: string;
    tutor_id: string;
  },
  userId: string,
) => {
  const user = await prisma.user.findUnique({
    where: {
      id: userId,
    },
  });
  if (!user) {
    throw new Error("Student not found");
  }

  const slot = await prisma.courseSlot.findUnique({
    where: {
      id: payload.course_slot_id,
    },
  });

  if (!slot) {
    throw new Error("Course Slot not found");
  }

  const existing = await prisma.booking.findFirst({
    where: {
      student_id: userId,
      course_slot_id: payload.course_slot_id,
    },
  });
  if (existing) throw new Error("You have already booked this slot");

  const result = await prisma.$transaction(async (tx) => {
    const tutor = await tx.tutorProfile.findUnique({
      where: { id: payload.tutor_id },
    });

    if (!tutor) {
      throw new Error("Tutor profile not found");
    }

    // Enforce the slot's capacity. A ONE_ON_ONE slot has capacity 1, so only a
    // single student can ever book it; a GROUP slot allows up to `capacity`
    // students. Cancelled bookings free up their seat.
    const activeBookings = await tx.booking.count({
      where: {
        course_slot_id: payload.course_slot_id,
        booking_status: { not: "CANCELLED" },
      },
    });
    if (activeBookings >= slot.capacity) {
      throw new Error("This session is full");
    }

    const start = new Date(slot.start_time).getTime();
    const end = new Date(slot.end_time).getTime();

    if (end <= start) {
      throw new Error("Invalid course slot duration");
    }

    const durationHours = (end - start) / (1000 * 60 * 60);
    const calculatedPrice = durationHours * tutor.hourly_rate;

    return await tx.booking.create({
      data: {
        student_id: userId,
        tutor_id: payload.tutor_id,
        course_slot_id: payload.course_slot_id,
        booking_status: "PENDING",
        total_price: calculatedPrice,
      },
    });
  });

  return result;
};

const getAllBookings = async (userID: string) => {
  const userData = await prisma.user.findUnique({
    where: { id: userID },
  });

  if (!userData) {
    throw new Error("Unauthorized!");
  }

  if (userData.role === "STUDENT") {
    const result = await prisma.booking.findMany({
      where: { student_id: userID },
      include: {
        tutor: true,
        // Include the slot's live seat usage so the calendar can show
        // "X / Y booked" (active, non-cancelled bookings out of capacity).
        courseSlot: {
          include: {
            _count: {
              select: {
                bookings: {
                  where: { booking_status: { not: "CANCELLED" } },
                },
              },
            },
          },
        },
        review: true
      },
    });
    return result;
  }
  if (userData.role === "ADMIN") {
    const result = await prisma.booking.findMany({
      include: {
        tutor: true,
        courseSlot: true,
        student: { select: privateUserSelect },
      },
    });
    return result;
  }

  if (userData.role === "TUTOR") {
    // first get the tutor profile to get tutor id
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userID },
    });

    if (!tutorProfile) {
      throw new Error("Tutor profile not found!");
    }

    const result = await prisma.booking.findMany({
      where: { tutor_id: tutorProfile.id },
      include: {
        tutor: true,
        courseSlot: true,
        student: { select: privateUserSelect },
      },
    });
    return result;
  }

  throw new Error("Invalid role!");
};

const updateBooking = async (
  bookingId: string,
  payload: { booking_status: "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED" },
  userID: string
) => {
  const user = await prisma.user.findUnique({ where: { id: userID } });
  if (!user) throw new Error("User not found");

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");


  if (user.role !== "ADMIN") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userID },
    });

    if (!tutorProfile) throw new Error("Tutor profile not found");
    if (booking.tutor_id !== tutorProfile.id) {
      throw new Error("Unauthorized! You can only update your own bookings");
    }
  }

  // Only the scheduling state may be changed here. `payment_status`,
  // `transaction_id` and `total_price` are deliberately excluded: payment state
  // is owned solely by the Stripe webhook, and the price is derived from the
  // slot duration and the tutor's rate at booking time. Passing the raw body
  // through previously let a tutor mark their own bookings PAID without paying.
  const { booking_status } = pick<{ booking_status?: string }>(payload, ["booking_status"]);

  if (!booking_status) {
    throw new Error("A booking_status is required");
  }
  if (!BOOKING_STATUSES.includes(booking_status as BookingStatusValue)) {
    throw new Error("Invalid booking status");
  }

  return prisma.booking.update({
    where: { id: bookingId },
    data: { booking_status: booking_status as BookingStatusValue },
  });
};

/**
 * How long before a session a student may still cancel and be refunded.
 *
 * The cutoff exists because the tutor has held that hour and has likely turned
 * other work away; inside the window, a student cancellation costs them
 * something real. A cancellation by the TUTOR is always refunded regardless of
 * timing — the student did not cause it and should not carry the cost.
 */
const CANCELLATION_WINDOW_HOURS = 24;

/**
 * Work out what cancelling this booking would do, without doing it.
 *
 * Exposed so the UI can tell the student the outcome BEFORE they confirm.
 * Asking someone to confirm an irreversible action without saying whether
 * they get their money back is not a real confirmation.
 */
const describeCancellation = (
  booking: { payment_status: string; booking_status: string },
  startTime: Date | string,
  cancelledByTutor: boolean,
) => {
  const msUntilStart = new Date(startTime).getTime() - Date.now();
  const withinWindow = msUntilStart < CANCELLATION_WINDOW_HOURS * 60 * 60 * 1000;
  const wasPaid = booking.payment_status === "PAID";

  const refundable = wasPaid && (cancelledByTutor || !withinWindow);

  return {
    refundable,
    withinWindow,
    wasPaid,
    hoursUntilStart: Math.max(0, msUntilStart / (60 * 60 * 1000)),
    windowHours: CANCELLATION_WINDOW_HOURS,
  };
};

/**
 * Cancel a booking, refunding it where the policy says so.
 *
 * Deliberately a separate operation from `updateBooking` rather than an extra
 * status a student may set. `updateBooking` is a general status setter for
 * tutors and admins; letting students into it would also let them mark their
 * own bookings CONFIRMED or COMPLETED. This endpoint has exactly one effect.
 *
 * The seat is freed automatically: capacity counts bookings that are not
 * CANCELLED, so no separate release step is needed.
 */
const cancelBooking = async (bookingId: string, userId: string) => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      courseSlot: { select: { start_time: true, name: true } },
      tutor: { select: { id: true, user_id: true, display_name: true } },
    },
  });
  if (!booking) throw new Error("Booking not found");

  let cancelledByTutor = false;

  if (user.role === "STUDENT") {
    if (booking.student_id !== userId) {
      throw new Error("Forbidden! This is not your booking");
    }
  } else if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    if (!tutorProfile || booking.tutor_id !== tutorProfile.id) {
      throw new Error("Forbidden! This is not your booking");
    }
    cancelledByTutor = true;
  } else if (user.role === "ADMIN") {
    // An admin cancelling is treated as a platform-side cancellation, so the
    // student is refunded as though the tutor had cancelled.
    cancelledByTutor = true;
  } else {
    throw new Error("Unauthorized!");
  }

  if (booking.booking_status === "CANCELLED") {
    throw new Error("This booking is already cancelled");
  }
  if (booking.booking_status === "COMPLETED") {
    throw new Error("A completed session cannot be cancelled");
  }

  const outcome = describeCancellation(
    booking,
    booking.courseSlot.start_time,
    cancelledByTutor,
  );

  // The refund happens first. If Stripe fails this throws and nothing below
  // runs, leaving the booking untouched rather than cancelled-but-unrefunded.
  let refundId: string | null = null;
  if (outcome.refundable) {
    const refund = await PaymentService.refundBooking(bookingId);
    refundId = refund.refundId;
  }

  const updated = await prisma.booking.update({
    where: { id: bookingId },
    data: {
      booking_status: "CANCELLED",
      cancelled_at: new Date(),
      ...(refundId
        ? { refund_id: refundId, payment_status: "REFUNDED" as const }
        : {}),
    },
  });

  // Tell the other party. A cancellation the counterparty doesn't hear about
  // is how someone ends up sitting in an empty video room.
  const sessionName = booking.courseSlot.name;
  if (cancelledByTutor) {
    await notify(
      [booking.student_id],
      refundId
        ? `Your session "${sessionName}" was cancelled by the tutor. A refund has been issued.`
        : `Your session "${sessionName}" was cancelled by the tutor.`,
      "/dashboard/bookings",
    );
  } else {
    await notify(
      [booking.tutor.user_id],
      `A student cancelled their booking for "${sessionName}".`,
      "/dashboard/bookings",
    );
  }

  return { booking: updated, refunded: Boolean(refundId), ...outcome };
};

export const BookingService = {
  createBookingIntoDB,
  getAllBookings,
  updateBooking,
  cancelBooking,
  describeCancellation,
  CANCELLATION_WINDOW_HOURS,
};
// End of booking processing logic

// booking validation final
