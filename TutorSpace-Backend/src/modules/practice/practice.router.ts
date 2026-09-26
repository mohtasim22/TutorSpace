import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { PracticeController } from "./practice.controller";
import { updatePracticeSetSchema } from "./practice.validation";

const router = express.Router();

// Generate a DRAFT set from one of the tutor's own materials. The result is
// stored unpublished — publishing is a separate, deliberate action below.
router.post(
  "/generate/:materialId",
  auth(UserRole.tutor),
  PracticeController.generate,
);

// Role-aware list: tutors see their drafts too, students see published only.
router.get(
  "/",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  PracticeController.getPracticeSets,
);

// Tutor edits the questions, or flips is_published once happy with them.
router.patch(
  "/:id",
  auth(UserRole.tutor),
  validateRequest(updatePracticeSetSchema),
  PracticeController.updatePracticeSet,
);

router.delete("/:id", auth(UserRole.tutor), PracticeController.deletePracticeSet);

export const practiceRouter = router;
