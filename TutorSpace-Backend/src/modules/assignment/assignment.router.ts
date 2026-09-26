import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { AssignmentController } from "./assignment.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createAssignmentSchema, gradeSubmissionSchema, submitAssignmentSchema } from "./assignment.validation";

const router = express.Router();

// Tutor creates an assignment.
router.post("/", auth(UserRole.tutor), validateRequest(createAssignmentSchema), AssignmentController.createAssignment);

// List assignments (role-aware: tutor -> theirs, student -> booked courses).
router.get(
  "/",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  AssignmentController.getAssignments,
);

// Tutor grades a submission. Declared before "/:id" so the literal
// "submissions" segment is never mistaken for an assignment id.
router.patch(
  "/submissions/:id/grade",
  auth(UserRole.tutor),
  validateRequest(gradeSubmissionSchema),
  AssignmentController.gradeSubmission,
);

// Student submits work for an assignment.
router.post(
  "/:id/submit",
  auth(UserRole.student),
  validateRequest(submitAssignmentSchema),
  AssignmentController.submitAssignment,
);

// Tutor opens one assignment with all its submissions.
router.get(
  "/:id",
  auth(UserRole.tutor, UserRole.admin),
  AssignmentController.getAssignmentById,
);

export const assignmentRouter = router;
