import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { slotController } from "./slot.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createSlotSchema, updateSlotSchema } from "./slot.validation";

const router = express.Router();

router.post("/", auth(UserRole.tutor), validateRequest(createSlotSchema), slotController.createSlot)
router.get("/tutor/:id", slotController.getAllSlotsByTutor)

router.get("/allslots", slotController.getAllSlots)
router.get("/:id",auth(UserRole.tutor, UserRole.student, UserRole.admin),  slotController.getSlotById)

router.patch("/:id", auth(UserRole.tutor), validateRequest(updateSlotSchema), slotController.updateSlot)
router.delete("/:id",auth(UserRole.tutor), slotController.deleteSlot)

export const courseSlotRouter = router;