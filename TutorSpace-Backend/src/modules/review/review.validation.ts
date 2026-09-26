import { z } from "zod";

export const createReviewSchema = z.object({
  body: z.object({
    booking_id: z.string().min(1, "A booking is required"),
    rating: z.number().int().min(1, "Rating must be between 1 and 5").max(5, "Rating must be between 1 and 5"),
    comment: z.string().optional().nullable(),
  }),
});

export const updateReviewSchema = z.object({
  body: z.object({
    rating: z.number().int().min(1).max(5).optional(),
    comment: z.string().optional().nullable(),
    // Moderation only — the service permits this for administrators alone.
    status: z.enum(["APPROVED", "REJECTED"]).optional(),
  }),
});
