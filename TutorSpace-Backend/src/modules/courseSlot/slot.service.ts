import { prisma } from "../../lib/prisma";
import { pick } from "../../lib/pick";

// Fields a tutor may set on a slot. `tutor_id` is taken from the session, and
// the derived/managed columns are never client-writable.
//
// `session_type` is deliberately absent: it is derived from `capacity` (see
// sessionTypeFor), so a slot can never claim to be one-to-one while holding
// five seats. `meeting_link` is absent too — the call is in-app, reached
// through the slot's id, and no external link is stored.
const SLOT_EDITABLE = [
    "name",
    "description",
    "date",
    "start_time",
    "end_time",
    "capacity",
    "course_id",
] as const;

/** One seat is a one-to-one session; more than one is a group session. */
const sessionTypeFor = (capacity: number) =>
    capacity > 1 ? ("GROUP" as const) : ("ONE_ON_ONE" as const);

const assertValidCapacity = (capacity: unknown) => {
    if (!Number.isInteger(capacity) || (capacity as number) < 1) {
        throw new Error("Capacity must be a whole number of at least 1");
    }
};

/**
 * A slot is locked once it has started. From then on it is a record of a
 * lesson that happened (or is happening), not a plan: changing its time or
 * seats would rewrite that record, and deleting it would cascade to its
 * bookings, their payment records and the reviews written about them.
 */
const hasStarted = (slot: { start_time: Date }) =>
    new Date(slot.start_time).getTime() <= Date.now();

const assertNotStarted = (slot: { start_time: Date }, action: "edit" | "delete") => {
    if (hasStarted(slot)) {
        throw new Error(`This class has already started, so it can't be ${action === "edit" ? "edited" : "deleted"}`);
    }
};

const assertStartsInFuture = (startTime: string | Date) => {
    if (new Date(startTime).getTime() <= Date.now()) {
        throw new Error("A class can't be scheduled in the past");
    }
};

const createSlotIntoDB = async (payload: any, userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { user_id: userId },
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    const data = pick<{ course_id?: string; start_time?: string; end_time?: string; capacity?: number }>(
        payload,
        SLOT_EDITABLE,
    );

    if (!data.course_id) {
        throw new Error("A course_id is required");
    }

    // The slot must belong to a course this tutor owns. Without this check a
    // tutor could publish a slot against ANOTHER tutor's course — and because
    // coursework entitlement is derived from booking → slot → course, students
    // booking that slot would gain access to the other tutor's materials,
    // assignments and announcements.
    const course = await prisma.course.findUnique({ where: { id: data.course_id } });
    if (!course || course.tutor_id !== tutorProfile.id) {
        throw new Error("You can only create slots for your own courses");
    }

    if (data.start_time && data.end_time) {
        if (new Date(data.end_time).getTime() <= new Date(data.start_time).getTime()) {
            throw new Error("Invalid course slot duration");
        }
    }
    if (data.start_time) assertStartsInFuture(data.start_time);

    const capacity = data.capacity ?? 1;
    assertValidCapacity(capacity);

    const result = await prisma.courseSlot.create({
        data: {
            ...data,
            capacity,
            session_type: sessionTypeFor(capacity),
            tutor_id: tutorProfile.id,
        } as any,
        include: {
            course: true
        }
    });
    return result;
};

const getAllSlots = async () => {

    const result = await prisma.courseSlot.findMany({
        include: {
            tutor: true,
            course: true,
        }
    });
    return result;
}


const getAllSlotsByTutor = async (tutorID: string) => {
    const result = await prisma.courseSlot.findMany({
        where: {
            tutor_id: tutorID,
        },
        include: {
            course: true,
            // Count how many students have actively booked each slot (cancelled
            // bookings free their seat), so the tutor's calendar can show
            // "3 / 10 booked" or mark an empty slot as still open.
            _count: {
                select: {
                    bookings: {
                        where: { booking_status: { not: "CANCELLED" } },
                    },
                },
            },
        }
    });
    return result;
}

const getSlotById = async (slotId: string, userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    const result = await prisma.courseSlot.findUnique({
        where: { id: slotId },
        include: {
            tutor: true,
            course: true,
        }
    });
    return result;
}

const updateSlot = async (slotId: string, payload: Partial<{
    name: string;
    description: string;
    date: Date;
    start_time: Date;
    end_time: Date;
    capacity: number;
    course_id: string;
}>, userId: string) => {

    const slot = await prisma.courseSlot.findUnique({
        where: { id: slotId },
    });

    if (!slot) {
        throw new Error("Slot not found");
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { user_id: userId },
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    if (slot.tutor_id !== tutorProfile.id) {
        throw new Error("Unauthorized! You can only update your own slots");
    }

    assertNotStarted(slot, "edit");

    const data = pick<{ course_id?: string; capacity?: number; start_time?: string; end_time?: string }>(
        payload,
        SLOT_EDITABLE,
    );

    // Without these, the lock above could be dodged by editing a future slot's
    // date into the past, and an edit could produce a class that ends before
    // it starts.
    if (data.start_time) assertStartsInFuture(data.start_time);
    const newStart = new Date(data.start_time ?? slot.start_time).getTime();
    const newEnd = new Date(data.end_time ?? slot.end_time).getTime();
    if (newEnd <= newStart) {
        throw new Error("Invalid course slot duration");
    }

    // Re-pointing a slot at a different course is allowed only if that course
    // is also the tutor's own.
    if (data.course_id && data.course_id !== slot.course_id) {
        const course = await prisma.course.findUnique({ where: { id: data.course_id } });
        if (!course || course.tutor_id !== tutorProfile.id) {
            throw new Error("You can only move a slot to your own course");
        }
    }

    if (data.capacity !== undefined) {
        assertValidCapacity(data.capacity);
    }

    // Only a real change of capacity is checked: the edit form always sends
    // the current value, and renaming a slot must not fail because of it.
    if (data.capacity !== undefined && data.capacity !== slot.capacity) {
        // Don't let an edit strand students who already hold a seat: a slot
        // with three active bookings cannot be cut down to one seat.
        const booked = await prisma.booking.count({
            where: { course_slot_id: slotId, booking_status: { not: "CANCELLED" } },
        });
        if (data.capacity < booked) {
            throw new Error(
                `${booked} student${booked === 1 ? " has" : "s have"} already booked this slot, so capacity can't be less than ${booked}`,
            );
        }
    }

    const result = await prisma.courseSlot.update({
        where: {
            id: slotId
        },
        data: {
            ...data,
            ...(data.capacity !== undefined && { session_type: sessionTypeFor(data.capacity) }),
        } as any,
        include: {
            course: true,
            tutor: true,
        }
    });
    return result;
};

const deleteSlot = async (slotId: string, userId: string) => {

    const slot = await prisma.courseSlot.findUnique({
        where: { id: slotId },
    });

    if (!slot) {
        throw new Error("Slot not found");
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { user_id: userId },
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    if (slot.tutor_id !== tutorProfile.id) {
        throw new Error("Unauthorized! You can only delete your own slots");
    }

    assertNotStarted(slot, "delete");

    // Deleting a slot deletes its bookings with it (cascade), which would
    // silently drop students who hold a seat — including paid ones, with no
    // refund. The tutor cancels those bookings first; cancelling refunds a
    // paid student and frees the slot to be deleted.
    const active = await prisma.booking.count({
        where: { course_slot_id: slotId, booking_status: { not: "CANCELLED" } },
    });
    if (active > 0) {
        throw new Error(
            `${active} student${active === 1 ? " has" : "s have"} booked this class. Cancel ${active === 1 ? "that booking" : "those bookings"} first (paid students are refunded), then delete the slot.`,
        );
    }

    // Even cancelled bookings can carry money history: the Stripe payment and
    // the refund issued for it. Deleting the slot would cascade to them and
    // erase the record that the money went back, so such a slot is kept.
    const withPayments = await prisma.booking.count({
        where: { course_slot_id: slotId, transaction_id: { not: null } },
    });
    if (withPayments > 0) {
        throw new Error(
            "This class has payment records (including refunds), so it is kept for the record and can't be deleted",
        );
    }

    const result = await prisma.courseSlot.delete({
        where: {
            id: slotId
        }
    });
    return result;
};

export const slotService = {
    createSlotIntoDB,
    getAllSlotsByTutor,
    getAllSlots,
    updateSlot,
    deleteSlot,
    getSlotById,
}