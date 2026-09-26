import express from "express";
import { tutorController } from "./tutor.controller";
import auth, { UserRole } from "../../middlewares/auth";
import { validateRequest } from "../../middlewares/validateRequest";
import { createTutorSchema, updateTutorSchema } from "./tutor.validation";


const router = express.Router();
// Requires a session: the profile is created for the signed-in tutor. Before,
// this route was unauthenticated and identified the account by an email address
// in the body, so anyone knowing a tutor's email could create their profile.
router.post("/", auth(UserRole.tutor), validateRequest(createTutorSchema), tutorController.createTutor);
router.get("/", tutorController.getAllTutor);
router.get("/single", tutorController.getTutor);
router.patch("/profile", auth(UserRole.tutor), validateRequest(updateTutorSchema), tutorController.updateTutor)
router.patch("/:id/verify", auth(UserRole.admin), validateRequest(updateTutorSchema), tutorController.updateTutor)
router.delete("/:id", auth(UserRole.tutor), tutorController.deleteTutor)

export const tutorRouter = router;