import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { NotificationController } from "./notification.controller";

const router = express.Router();

// Any logged-in user can read their own notifications and mark them read.
router.get(
  "/",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  NotificationController.getMyNotifications,
);
router.patch(
  "/read",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  NotificationController.markAllRead,
);

export const notificationRouter = router;
