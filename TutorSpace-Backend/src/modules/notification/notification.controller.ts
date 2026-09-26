import { NextFunction, Request, Response } from "express";
import { NotificationService } from "./notification.service";

const getMyNotifications = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await NotificationService.getMyNotifications(req.user?.id as string);
    res.status(200).json({ status: "success", ...result });
  } catch (e) {
    next(e);
  }
};

const markAllRead = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await NotificationService.markAllRead(req.user?.id as string);
    res.status(200).json({ status: "success", message: "Marked all as read" });
  } catch (e) {
    next(e);
  }
};

export const NotificationController = { getMyNotifications, markAllRead };
