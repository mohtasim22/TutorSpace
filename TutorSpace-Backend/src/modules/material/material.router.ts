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

// Tutor deletes one of their materials.
router.delete("/:id", auth(UserRole.tutor), MaterialController.deleteMaterial);

export const materialRouter = router;
