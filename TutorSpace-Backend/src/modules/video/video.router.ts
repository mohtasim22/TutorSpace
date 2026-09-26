import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { VideoController } from "./video.controller";

const router = express.Router();

// Get (or lazily create) the video room URL for a session slot.
router.get(
  "/:slotId/room",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  VideoController.getRoom,
);

export const videoRouter = router;
