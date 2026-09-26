import { Review } from "../../generated/prisma/client";
import { prisma } from "../../lib/prisma";
import { pick } from "../../lib/pick";
import { privateUserSelect, publicUserSelect } from "../../lib/select";

const recalculateTutorRating = async (tutorId: string) => {
    const reviews = await prisma.review.findMany({
        where: { tutor_id: tutorId },
    });

    const total = reviews.length;
    const avg = total
        ? Math.round((reviews.reduce((sum, r) => sum + r.rating, 0) / total) * 10) / 10
        : 0;

    await prisma.tutorProfile.update({
        where: { id: tutorId },
        data: {
            rating_avg: avg,
            total_reviews: total,
        },
    });
};

const createReviewIntoDB = async (payload: Omit<Review, "id" | "createdAt" | "updatedAt">, userId: string) => {
    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });
    if (!user) {
        throw new Error("User not found");
    }
    

    const booking = await prisma.booking.findUnique({
        where: {
            id: payload.booking_id,
        },
    });
    if (!booking) {
        throw new Error("Booking not found");
    }

    if (booking.student_id !== user.id) throw new Error("Unauthorized! You can only review your own bookings");
    if (booking.booking_status !== "COMPLETED") throw new Error("You can only review completed sessions");

    // Whitelist: a reviewer supplies only a rating and a comment. `status` is
    // a moderation field and must not be settable by the author; `student_id`
    // and `tutor_id` are derived from the booking, never from the request.
    const fields = pick<{ rating?: unknown; comment?: string }>(payload, ["rating", "comment"]);

    const rating = fields.rating;
    if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
        throw new Error("Rating must be a whole number between 1 and 5");
    }

    const result = await prisma.review.create({
        data: {
            rating,
            comment: fields.comment ?? null,
            booking_id: booking.id,
            student_id: user.id,
            tutor_id: booking.tutor_id,
        },
    });
    // Recalculate against the booking's tutor, not a client-supplied id — the
    // review is created for `booking.tutor_id`, so anything else would refresh
    // the wrong tutor's aggregate and leave this one stale.
    await recalculateTutorRating(booking.tutor_id);
    return result;
};

const getAllReviews = async (userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    if (user.role === "STUDENT") {
        return prisma.review.findMany({
            where: { student_id: userId },
            include: {
                booking: {
                    include: { courseSlot: true },
                },
                tutor: true,
            },
        });
    }
    if (user.role === "ADMIN") {
        return prisma.review.findMany({
            include: {
                student: { select: privateUserSelect },
                tutor: {
                    include: { user: { select: privateUserSelect } }
                },
                booking: {
                    include: { courseSlot: { include: { course: true } } },
                },
            },
            orderBy: { createdAt: "desc" }
        });
    }

    if (user.role === "TUTOR") {
        const tutorProfile = await prisma.tutorProfile.findUnique({
            where: { user_id: userId },
        });

        if (!tutorProfile) throw new Error("Tutor profile not found");

        return prisma.review.findMany({
            where: { tutor_id: tutorProfile.id },
            include: {
                booking: {
                    include: { courseSlot: true },
                },
                student: { select: privateUserSelect },
            },
        });
    }

    throw new Error("Invalid role");
};

const updateReview = async (reviewId: string, payload: Partial<{
    rating: number;
    comment: string;
    status: "APPROVED" | "REJECTED"
}>, userId: string) => {

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new Error("Review not found");
    }

    const user = await prisma.user.findUnique({
        where: {
            id: userId,
        },
    });

    const isAdmin = user?.role === "ADMIN";

    if (!isAdmin && review.student_id !== user?.id) {
        throw new Error("Unauthorized! You can only update your own reviews");
    }

    // The author may amend what they wrote; only an administrator may change
    // the moderation status. Passing the raw body through previously let a
    // student set `status: "APPROVED"` on a review an admin had rejected — and
    // let them rewrite `tutor_id` to move the review onto a different tutor.
    const data = isAdmin
        ? pick(payload, ["rating", "comment", "status"])
        : pick(payload, ["rating", "comment"]);

    if (Object.keys(data).length === 0) {
        throw new Error("Nothing to update");
    }

    const rating = (data as { rating?: unknown }).rating;
    if (rating !== undefined) {
        if (typeof rating !== "number" || !Number.isInteger(rating) || rating < 1 || rating > 5) {
            throw new Error("Rating must be a whole number between 1 and 5");
        }
    }

    const result = await prisma.review.update({
        where: {
            id: reviewId
        },
        data,
    });
    await recalculateTutorRating(review.tutor_id);
    return result;
};

const deleteReview = async (reviewId: string, userId: string) => {

    const review = await prisma.review.findUnique({
        where: { id: reviewId },
    });

    if (!review) {
        throw new Error("Review not found");
    }

    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) {
        throw new Error("User not found");
    }

    if (user.role !== "ADMIN" && review.student_id !== user.id) {
        throw new Error("Unauthorized! You can only delete your own reviews");
    }

    const result = await prisma.review.delete({
        where: {
            id: reviewId
        }
    });
    await recalculateTutorRating(review.tutor_id);
    return result;
};


const getTutorReviewsById = async (tutorId: string, userId: string) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
    });

    if (!user) throw new Error("User not found");

    const tutor = await prisma.tutorProfile.findUnique({
        where: { id: tutorId },
    });

    if (!tutor) throw new Error("Tutor not found");

    const reviews = await prisma.review.findMany({
        where: { tutor_id: tutorId },
        include: {
            student: { select: publicUserSelect },
            booking: {
                include: {
                    courseSlot: true,
                },
            },
        },
        orderBy: { createdAt: "desc" },
    });

    return reviews;
};

const getPublicTutorReviews = async (tutorId: string) => {
    const tutor = await prisma.tutorProfile.findUnique({ where: { id: tutorId } });
    if (!tutor) throw new Error("Tutor not found");

    return prisma.review.findMany({
        where: {
            tutor_id: tutorId,
            status: "APPROVED", // ✅ only approved
        },
        include: {
            // Public route — a reviewer's email address must not be published
            // alongside their review.
            student: { select: publicUserSelect },
            booking: {
                include: { courseSlot: true },
            },
        },
        orderBy: { createdAt: "desc" },
    });
};

export const reviewService = {
    createReviewIntoDB,
    getAllReviews,
    getPublicTutorReviews,
    getTutorReviewsById,
    updateReview,
    deleteReview
}
// End of review data operations
