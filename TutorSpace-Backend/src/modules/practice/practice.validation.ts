import { z } from "zod";

const questionSchema = z.object({
  type: z.enum(["mcq", "short_answer"]),
  question: z.string().min(1, "A question is required"),
  options: z.array(z.string()),
  answer: z.string().min(1, "An answer is required"),
  explanation: z.string(),
});

export const updatePracticeSetSchema = z.object({
  body: z.object({
    title: z.string().min(1).optional(),
    questions: z.array(questionSchema).optional(),
    is_published: z.boolean().optional(),
  }),
});
