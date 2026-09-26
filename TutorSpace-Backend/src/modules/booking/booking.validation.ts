import { z } from "zod";

export const createBookingSchema = z.object({
  body: z.object({
    course_slot_id: z.string().min(1, "A session slot is required"),
    tutor_id: z.string().min(1, "A tutor is required"),
  }),
});

// Only the scheduling state is accepted. payment_status and transaction_id are
// owned by the Stripe webhook and are absent here by design.
export const updateBookingSchema = z.object({
  body: z.object({
    booking_status: z.enum(["PENDING", "CONFIRMED", "CANCELLED", "COMPLETED"]),
  }),
});
