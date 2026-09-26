import { NextFunction, Request, Response } from "express";
import { PracticeService } from "./practice.service";

const generate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await PracticeService.generateFromMaterial(
      req.params?.materialId as string,
      req.user?.id as string,
    );
    res.status(201).json({
      status: "success",
      message: "Draft practice questions generated. Review them before publishing.",
      practiceSet: result,
    });
  } catch (e) {
    next(e);
  }
};

const getPracticeSets = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await PracticeService.getPracticeSets(req.user?.id as string);
    res.status(200).json({
      status: "success",
      message: "Practice sets retrieved successfully",
      practiceSets: result,
    });
  } catch (e) {
    next(e);
  }
};

const updatePracticeSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await PracticeService.updatePracticeSet(
      req.params?.id as string,
      req.user?.id as string,
      req.body,
    );
    res.status(200).json({
      status: "success",
      message: "Practice set updated successfully",
      practiceSet: result,
    });
  } catch (e) {
    next(e);
  }
};

const deletePracticeSet = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await PracticeService.deletePracticeSet(
      req.params?.id as string,
      req.user?.id as string,
    );
    res.status(200).json({
      status: "success",
      message: "Practice set deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

export const PracticeController = {
  generate,
  getPracticeSets,
  updatePracticeSet,
  deletePracticeSet,
};
