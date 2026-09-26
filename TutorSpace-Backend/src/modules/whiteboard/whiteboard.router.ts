import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { WhiteboardController } from "./whiteboard.controller";
import { saveSnapshotSchema } from "./whiteboard.validation";

const router = express.Router();

// Resolve the room id for a session's board. This is the access check — the
// room id is only ever issued to someone entitled to be in the session.
router.get(
  "/:slotId/access",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  WhiteboardController.getAccess,
);

// Tutor saves an export of the board into the course's materials.
router.post(
  "/:slotId/snapshot",
  auth(UserRole.tutor, UserRole.admin),
  validateRequest(saveSnapshotSchema),
  WhiteboardController.saveSnapshot,
);

export const whiteboardRouter = router;
