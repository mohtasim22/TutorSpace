import { NextFunction, Request, Response } from "express";
import { ReminderService } from "./reminder.service";

// Triggered by the external scheduler (cron-job.org). Protected by a shared
// secret in the Authorization header instead of a user session.
const runReminders = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const secret = process.env.CRON_SECRET;
    const authHeader = req.headers.authorization;

    if (!secret || authHeader !== `Bearer ${secret}`) {
      return res.status(401).json({ status: "error", message: "Unauthorized" });
    }

    const result = await ReminderService.runReminders();
    res.status(200).json({
      status: "success",
      message: "Reminders processed",
      ...result,
    });
  } catch (e) {
    next(e);
  }
};

export const ReminderController = { runReminders };
