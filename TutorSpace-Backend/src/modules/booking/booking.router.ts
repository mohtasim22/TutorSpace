import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { BookingController } from "./booking.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createBookingSchema, updateBookingSchema } from "./booking.validation";

const router = express.Router();
router.post("/", auth(UserRole.student), validateRequest(createBookingSchema), BookingController.createBooking);
router.get("/", auth(UserRole.student, UserRole.tutor, UserRole.admin), BookingController.getAllBookings);
router.patch("/:id", auth(UserRole.tutor, UserRole.admin), validateRequest(updateBookingSchema), BookingController.updateBooking);

// Cancellation is its own endpoint rather than a status a student may PATCH.
// The PATCH above is a general status setter; opening it to students would let
// them mark their own bookings CONFIRMED or COMPLETED too. This does one thing,
// and applies the refund policy while doing it.
router.post("/:id/cancel", auth(UserRole.student, UserRole.tutor, UserRole.admin), BookingController.cancelBooking);
export const bookingRouter = router;