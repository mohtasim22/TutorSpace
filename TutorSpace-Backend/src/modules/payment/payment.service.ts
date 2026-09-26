import Stripe from "stripe";
import { prisma } from "../../lib/prisma";
import { contactUserSelect } from "../../lib/select";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY as string, {
  apiVersion: "2024-04-10" as any, // fallback to any if TS complains
});

// BDT is a two-decimal currency, so the `unit_amount * 100` conversion below
// is correct for it as well as for the USD fallback.
const CURRENCY = (process.env.STRIPE_CURRENCY || "bdt").toLowerCase();

const createCheckoutSession = async (userId: string, bookingId: string) => {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    include: {
      student: { select: contactUserSelect },
      tutor: true,
      courseSlot: { include: { course: true } },
    },
  });

  if (!booking) throw new Error("Booking not found");
  if (booking.student_id !== userId) throw new Error("Unauthorized");
  if (booking.payment_status === "PAID") throw new Error("Already paid");

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ["card"],
    customer_email: booking.student.email,
    line_items: [
      {
        price_data: {
          // The platform prices in Bangladeshi Taka. Kept configurable because
          // which presentment currencies a Stripe account may charge in depends
          // on the account's country — if a test charge is rejected with an
          // unsupported-currency error, set STRIPE_CURRENCY=usd to fall back.
          currency: CURRENCY,
          product_data: {
            name: `Tutoring Session: ${booking.courseSlot.course.name}`,
            description: `Tutor: ${booking.tutor.display_name}`,
          },
          unit_amount: Math.round(booking.total_price * 100), // Stripe uses cents
        },
        quantity: 1,
      },
    ],
    metadata: {
      bookingId: booking.id, // For the webhook to know which booking this is
    },
    mode: "payment",
    success_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/bookings?payment=success`,
    cancel_url: `${process.env.FRONTEND_URL || "http://localhost:3000"}/dashboard/bookings?payment=cancelled`,
  });

  if (!session.url) throw new Error("Failed to generate Stripe checkout URL");

  return { url: session.url };
};

const processWebhook = async (rawBody: Buffer, signature: string) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) throw new Error("Missing Stripe Webhook Secret");

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(rawBody, signature, webhookSecret);
  } catch (err: any) {
    throw new Error(`Webhook Error: ${err.message}`);
  }

  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;

    const bookingId = session.metadata?.bookingId;
    if (!bookingId) throw new Error("No bookingId in metadata");

    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        payment_status: "PAID",
        transaction_id: session.id, // Store stripe session ID
      },
    });
  }
};

/**
 * Refund a paid booking in full.
 *
 * Two things make this less direct than it looks:
 *
 * 1. `transaction_id` holds the Checkout *Session* id (cs_...), not a
 *    PaymentIntent, and Stripe refunds a PaymentIntent. The intent is resolved
 *    from the session here rather than by a schema change, because that also
 *    works for bookings taken before refunds existed.
 *
 * 2. The refund is issued BEFORE the booking is updated, and the caller only
 *    writes the cancellation once this resolves. If Stripe fails, nothing is
 *    recorded and the booking is left exactly as it was — a booking marked
 *    cancelled while the money is still held would be the worst outcome.
 *
 * Known limitation: if Stripe succeeds and the caller's database write then
 * fails, the money is returned while the booking still reads PAID. The
 * existing-refund check below is what makes the retry correct rather than
 * double-refunding, but the window is not zero.
 */
const refundBooking = async (bookingId: string) => {
  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking) throw new Error("Booking not found");
  if (booking.payment_status !== "PAID") {
    throw new Error("This booking has not been paid, so there is nothing to refund");
  }
  if (!booking.transaction_id) {
    throw new Error("This booking has no payment on record to refund");
  }

  const session = await stripe.checkout.sessions.retrieve(booking.transaction_id);
  const paymentIntentId =
    typeof session.payment_intent === "string"
      ? session.payment_intent
      : session.payment_intent?.id;

  if (!paymentIntentId) {
    throw new Error("Could not find the original payment to refund");
  }

  // If a refund already exists — because a previous attempt succeeded at
  // Stripe but failed to record here — reuse it instead of refunding twice.
  const existing = await stripe.refunds.list({
    payment_intent: paymentIntentId,
    limit: 1,
  });
  if (existing.data.length > 0) {
    return { refundId: existing.data[0]!.id, alreadyRefunded: true };
  }

  const refund = await stripe.refunds.create({
    payment_intent: paymentIntentId,
    reason: "requested_by_customer",
    metadata: { bookingId: booking.id },
  });

  return { refundId: refund.id, alreadyRefunded: false };
};

export const PaymentService = {
  createCheckoutSession,
  processWebhook,
  refundBooking,
};

// End of Stripe payment abstraction

// payment abstraction final
