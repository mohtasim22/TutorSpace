import { NextFunction, Request, Response } from "express";
import { WhiteboardService } from "./whiteboard.service";

const getAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await WhiteboardService.getAccess(
      req.params?.slotId as string,
      req.user?.id as string,
    );
    res.status(200).json({
      status: "success",
      message: "Whiteboard ready",
      ...result,
    });
  } catch (e) {
    next(e);
  }
};

const saveSnapshot = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await WhiteboardService.saveSnapshot(
      req.params?.slotId as string,
      req.user?.id as string,
      req.body,
    );
    res.status(201).json({
      status: "success",
      message: "Whiteboard saved to course materials",
      material: result,
    });
  } catch (e) {
    next(e);
  }
};

export const WhiteboardController = { getAccess, saveSnapshot };
