import { z } from "zod";

export const createAssignmentSchema = z.object({
  body: z.object({
    title: z.string().min(1, "Title is required"),
    description: z.string().min(1, "Description is required"),
    course_id: z.string().min(1, "A course must be selected"),
    due_date: z.string().optional().nullable(),
  }),
});

export const submitAssignmentSchema = z.object({
  body: z.object({
    file_url: z.string().min(1, "A file is required to submit"),
    note: z.string().optional().nullable(),
  }),
});

export const gradeSubmissionSchema = z.object({
  body: z.object({
    grade: z
      .number()
      .int("Grade must be a whole number")
      .min(0, "Grade cannot be negative")
      .max(100, "Grade cannot exceed 100"),
    feedback: z.string().optional().nullable(),
  }),
});
