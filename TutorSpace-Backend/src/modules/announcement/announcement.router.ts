import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { AnnouncementController } from "./announcement.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createAnnouncementSchema } from "./announcement.validation";

const router = express.Router();

// Tutor posts an announcement.
router.post("/", auth(UserRole.tutor), validateRequest(createAnnouncementSchema), AnnouncementController.createAnnouncement);

// List announcements (role-aware: tutor -> their courses, student -> booked).
router.get(
  "/",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  AnnouncementController.getAnnouncements,
);

// Tutor deletes one of their announcements.
router.delete("/:id", auth(UserRole.tutor), AnnouncementController.deleteAnnouncement);

export const announcementRouter = router;
