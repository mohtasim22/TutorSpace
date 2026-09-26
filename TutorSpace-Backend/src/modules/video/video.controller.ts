import { NextFunction, Request, Response } from "express";
import { VideoService } from "./video.service";

const getRoom = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await VideoService.getOrCreateRoom(
      req.params?.slotId as string,
      req.user?.id as string,
    );
    res.status(200).json({
      status: "success",
      message: "Video room ready",
      url: result.url,
      title: result.title,
      isOwner: result.isOwner,
    });
  } catch (e) {
    next(e);
  }
};

export const VideoController = { getRoom };
