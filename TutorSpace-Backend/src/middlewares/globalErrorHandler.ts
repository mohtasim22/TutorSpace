import { NextFunction, Request, Response } from "express";
import { Prisma } from "../generated/prisma/client";
import { ZodError } from "zod";

export function errorHandler(
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) {
  let statusCode = 500;
  let message = "Internal server Error!";

  if (err instanceof ZodError) {
    statusCode = 400;
    message = err.issues.map((e: any) => e.message).join(", ");
  }
  else if (err instanceof Prisma.PrismaClientValidationError) {
    statusCode = 400;
    message = "Incorrect body or missing fields";
  }


  else if (err instanceof Prisma.PrismaClientKnownRequestError) {
    statusCode = 400;
    switch (err.code) {
      case "P2002":
        message = "A record with this value already exists"; 
        break;
      case "P2025":
        message = "Record not found"; 
        statusCode = 404;
        break;
      case "P2003":
        message = "Foreign key constraint failed"; 
        break;
      default:
        message = "Database error";
    }
  }


  else if (err instanceof Error) {
    statusCode = err.message.toLowerCase().includes("not found") ? 404
      : err.message.toLowerCase().includes("unauthorized") ? 401
      : err.message.toLowerCase().includes("forbidden") ? 403
      : 400;
    message = err.message;
  }


  else if (err.name === "JsonWebTokenError") {
    statusCode = 401;
    message = "Invalid token";
  }

  else if (err.name === "TokenExpiredError") {
    statusCode = 401;
    message = "Token expired";
  }


  else if (err.statusCode) {
    statusCode = err.statusCode;
    message = err.message || message;
  }

  if (process.env.NODE_ENV !== "production") {
    console.error("Error:", err)
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV !== "production" && { error: err }), 
  });
}
// End of global error catching middleware
