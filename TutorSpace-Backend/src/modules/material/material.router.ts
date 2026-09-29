import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { MaterialController } from "./material.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createMaterialSchema } from "./material.validation";

const router = express.Router();

// Tutor uploads a material.
router.post("/", auth(UserRole.tutor), validateRequest(createMaterialSchema), MaterialController.createMaterial);

// List materials (role-aware: tutor -> their courses, student -> booked courses).
router.get(
  "/",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  MaterialController.getMaterials,
);

// AI summary of a PDF material. Generated on first request and stored, so
// every student in the course reads the same summary. Access is checked in
// the service: the course's tutor, or a student with a paid booking in it.
router.post(
  "/:id/summary",
  auth(UserRole.student, UserRole.tutor, UserRole.admin),
  MaterialController.summarise,
);

// Tutor deletes one of their materials.
router.delete("/:id", auth(UserRole.tutor), MaterialController.deleteMaterial);

export const materialRouter = router;
