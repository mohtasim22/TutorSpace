import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { PaymentController } from "./payment.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createCheckoutSessionSchema } from "./payment.validation";

const router = express.Router();

router.post("/create-checkout-session", auth(UserRole.student), validateRequest(createCheckoutSessionSchema), PaymentController.createCheckoutSession);

export const paymentRouter = router;
