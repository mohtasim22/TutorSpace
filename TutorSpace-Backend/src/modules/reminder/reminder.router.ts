import express from "express";
import { ReminderController } from "./reminder.controller";

const router = express.Router();

// GET and POST both accepted so any scheduler config works. Auth is the
// CRON_SECRET bearer token, checked inside the controller.
router.get("/reminders", ReminderController.runReminders);
router.post("/reminders", ReminderController.runReminders);

export const reminderRouter = router;
