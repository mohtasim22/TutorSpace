import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { adminController } from "./admin.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { updateUserStatusSchema } from "./admin.validation";

const router = express.Router();


router.get("/users",auth(UserRole.admin), adminController.getAllUsers)
router.get("/stats", auth(UserRole.admin), adminController.getAdminStats);
router.patch("/users/:id/status", auth(UserRole.admin), validateRequest(updateUserStatusSchema), adminController.updateUserStatus);


export const adminRouter = router;