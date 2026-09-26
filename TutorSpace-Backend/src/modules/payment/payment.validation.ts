import { z } from "zod";

export const createCheckoutSessionSchema = z.object({
  body: z.object({
    bookingId: z.string().min(1, "A booking is required"),
  }),
});
