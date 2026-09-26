import { z } from "zod";

export const createMaterialSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    file_url: z.string().min(1, "A file is required"),
    course_id: z.string().min(1, "A course must be selected"),
  }),
});
