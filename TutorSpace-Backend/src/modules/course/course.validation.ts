import { z } from "zod";

export const createCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Course name is required"),
    description: z.string().min(1, "Description is required"),
  }),
});

export const updateCourseSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().min(1).optional(),
    status: z.enum(["ACTIVE", "INACTIVE"]).optional(),
  }),
});
