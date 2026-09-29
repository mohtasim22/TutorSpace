import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { PracticeController } from "./practice.controller";
import { updatePracticeSetSchema } from "./practice.validation";

const router = express.Router();

// Generate a quiz from a PDF material. A student's quiz is private to them; a
// tutor's set is stored unpublished and published separately below.
router.post(
  "/generate/:materialId",
  auth(UserRole.student, UserRole.tutor),
  PracticeController.generate,
);

// Role-aware list: tutors see their course sets including drafts; students see
// their own quizzes plus sets their tutors have published.
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

// Tutor deletes a course set; student deletes one of their own quizzes.
router.delete(
  "/:id",
  auth(UserRole.student, UserRole.tutor),
  PracticeController.deletePracticeSet,
);

export const practiceRouter = router;
