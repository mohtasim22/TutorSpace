import { NextFunction, Request, Response } from "express";
import { PaymentService } from "./payment.service";

const createCheckoutSession = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { bookingId } = req.body;
    const userId = req.user?.id as string;

    const result = await PaymentService.createCheckoutSession(userId, bookingId);

    res.status(200).json({
      status: "success",
      message: "Checkout session created",
      url: result.url,
    });
  } catch (e) {
    next(e);
  }
};

const handleWebhook = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const sig = req.headers["stripe-signature"] as string;
    // req.body is an unparsed buffer due to express.raw()
    await PaymentService.processWebhook(req.body, sig);

    res.status(200).send("Webhook received");
  } catch (e) {
    // Stripe requires returning an error response on webhook failures
    res.status(400).send(`Webhook Error: ${e instanceof Error ? e.message : 'Unknown Error'}`);
  }
};

export const PaymentController = {
  createCheckoutSession,
  handleWebhook,
};

// End of payment processing integration

// payment webhook final
