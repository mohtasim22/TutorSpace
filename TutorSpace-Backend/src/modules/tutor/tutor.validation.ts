import { z } from "zod";

// Request-shape validation. This runs BEFORE the service layer, which also
// whitelists fields before they reach Prisma. The two are complementary:
// this rejects malformed input with a clear message, the whitelist guarantees
// that even a field that passes validation cannot write a column it shouldn't.

export const createTutorSchema = z.object({
  body: z.object({
    display_name: z.string().min(1, "Display name is required"),
    bio: z.string().min(1, "Bio is required"),
    qualification: z.string().min(1, "Qualification is required"),
    hourly_rate: z.number().nonnegative("Hourly rate cannot be negative").optional(),
  }),
});

export const updateTutorSchema = z.object({
  body: z.object({
    display_name: z.string().min(1).optional(),
    bio: z.string().min(1).optional(),
    qualification: z.string().min(1).optional(),
    hourly_rate: z.number().nonnegative("Hourly rate cannot be negative").optional(),
    // Accepted only on the admin verify route; the service ignores it for tutors.
    is_verified: z.boolean().optional(),
  }),
});
