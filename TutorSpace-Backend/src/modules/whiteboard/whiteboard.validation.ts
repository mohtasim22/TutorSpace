import { z } from "zod";

export const saveSnapshotSchema = z.object({
  body: z.object({
    file_url: z.string().min(1, "A file is required"),
    title: z.string().optional(),
  }),
});
