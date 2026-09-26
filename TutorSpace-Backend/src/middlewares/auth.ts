import { NextFunction, Request, Response } from "express";
import { auth as betterAuthInstance } from "../lib/auth";
import { fromNodeHeaders } from "better-auth/node";

export enum UserRole {
  admin = "ADMIN",
  student = "STUDENT",
  tutor = "TUTOR",
}

const auth = (...roles: UserRole[]) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // const session =
      //   req.cookies["__Secure-session_token"] || req.cookies["session_token"];

      const session = await betterAuthInstance.api.getSession({
        headers: fromNodeHeaders(req.headers),
      });

      if (!session) {
        throw new Error("Unauthorized! Session not found or invalid.");
      }

      const { user } = session;

      if (user.status !== "ACTIVE") {
        throw new Error("Unauthorized! Account is not active.");
      }

      if (roles.length && !roles.includes(user.role as UserRole)) {
        throw new Error("Unauthorized! Insufficient permissions.");
      }

      req.user = user;

      next();
    } catch (error: any) {
      next(error);
    }
  };
};

export default auth;