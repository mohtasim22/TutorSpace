import { NextFunction, Request, Response } from "express";
import { BookingService } from "./booking.service";
import { create } from "node:domain";

const createBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.createBookingIntoDB(
      req.body,
      req.user?.id,
    );

    res.status(201).json({
      status: "success",
      message: "Booking created successfully",
      booking: result,
    });
  } catch (error: any) {
    next(error);
  }
};

const getAllBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.getAllBookings(req.user?.id,);
    res.status(201).json(result)
  } catch (e) {
    next(e);
  }
}

const updateBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.updateBooking(req.params?.id as string, req.body, req.user?.id as string);
    res.status(200).json({
      status: "success",
      message: "Booking updated successfully",
      booking: result,
    });
  } catch (e) {
    next(e);
  }
}



const cancelBooking = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await BookingService.cancelBooking(
      req.params?.id as string,
      req.user?.id as string,
    );
    res.status(200).json({
      status: "success",
      message: result.refunded
        ? "Booking cancelled and refunded"
        : "Booking cancelled",
      booking: result.booking,
      refunded: result.refunded,
      withinWindow: result.withinWindow,
    });
  } catch (e) {
    next(e);
  }
};

export const BookingController = {
  // Add controller methods here
  createBooking,
  getAllBookings,
  updateBooking,
  cancelBooking,
};
// End of booking action handlers

// booking endpoints final
