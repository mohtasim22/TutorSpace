import { prisma } from "../../lib/prisma";
import { pick } from "../../lib/pick";

// Fields a tutor may set on a slot. `tutor_id` is taken from the session, and
// the derived/managed columns are never client-writable.
const SLOT_EDITABLE = [
    "name",
    "description",
    "date",
    "start_time",
    "end_time",
    "meeting_link",
    "session_type",
    "capacity",
    "course_id",
] as const;

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

    if (data.capacity !== undefined && (!Number.isInteger(data.capacity) || data.capacity < 1)) {
        throw new Error("Capacity must be a whole number of at least 1");
    }

    const result = await prisma.courseSlot.create({
        data: { ...data, tutor_id: tutorProfile.id } as any,
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
    meeting_link: string;
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

    const data = pick<{ course_id?: string; capacity?: number }>(payload, SLOT_EDITABLE);

    // Re-pointing a slot at a different course is allowed only if that course
    // is also the tutor's own.
    if (data.course_id && data.course_id !== slot.course_id) {
        const course = await prisma.course.findUnique({ where: { id: data.course_id } });
        if (!course || course.tutor_id !== tutorProfile.id) {
            throw new Error("You can only move a slot to your own course");
        }
    }

    if (data.capacity !== undefined && (!Number.isInteger(data.capacity) || data.capacity < 1)) {
        throw new Error("Capacity must be a whole number of at least 1");
    }

    const result = await prisma.courseSlot.update({
        where: {
            id: slotId
        },
        data: data as any,
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