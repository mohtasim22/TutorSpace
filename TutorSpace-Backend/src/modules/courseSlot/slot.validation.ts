import { z } from "zod";

// There is no session_type field: the server derives it from capacity
// (1 seat = one-to-one, more = group). There is no meeting_link either — the
// video call is in-app and reached through the slot's id.

export const createSlotSchema = z.object({
  body: z.object({
    name: z.string().min(1, "Slot name is required"),
    description: z.string().optional().nullable(),
    course_id: z.string().min(1, "A course must be selected"),
    date: z.string().min(1, "A date is required"),
    start_time: z.string().min(1, "A start time is required"),
    end_time: z.string().min(1, "An end time is required"),
    capacity: z.number().int().min(1, "Capacity must be at least 1").optional(),
  }),
});

export const updateSlotSchema = z.object({
  body: z.object({
    name: z.string().min(1).optional(),
    description: z.string().optional().nullable(),
    course_id: z.string().min(1).optional(),
    date: z.string().min(1).optional(),
    start_time: z.string().min(1).optional(),
    end_time: z.string().min(1).optional(),
    capacity: z.number().int().min(1, "Capacity must be at least 1").optional(),
  }),
});
