import { NextFunction, Request, Response } from "express";
import { AnnouncementService } from "./announcement.service";

const createAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AnnouncementService.createAnnouncement(req.body, req.user?.id as string);
    res.status(201).json({
      status: "success",
      message: "Announcement posted successfully",
      announcement: result,
    });
  } catch (e) {
    next(e);
  }
};

const getAnnouncements = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AnnouncementService.getAnnouncements(req.user?.id as string);
    res.status(200).json({
      status: "success",
      message: "Announcements retrieved successfully",
      announcements: result,
    });
  } catch (e) {
    next(e);
  }
};

const deleteAnnouncement = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await AnnouncementService.deleteAnnouncement(req.params?.id as string, req.user?.id as string);
    res.status(200).json({
      status: "success",
      message: "Announcement deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

export const AnnouncementController = {
  createAnnouncement,
  getAnnouncements,
  deleteAnnouncement,
};
