import { z } from "zod";

export const createAnnouncementSchema = z.object({
  body: z.object({
    message: z.string().min(1, "A message is required"),
    course_id: z.string().min(1, "A course must be selected"),
  }),
});
