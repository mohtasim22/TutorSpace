import { NextFunction, Request, Response } from "express";
import { MaterialService } from "./material.service";
import { MaterialSummaryService } from "./materialSummary.service";

const createMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MaterialService.createMaterial(req.body, req.user?.id as string);
    res.status(201).json({
      status: "success",
      message: "Material uploaded successfully",
      material: result,
    });
  } catch (e) {
    next(e);
  }
};

const getMaterials = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MaterialService.getMaterials(req.user?.id as string);
    res.status(200).json({
      status: "success",
      message: "Materials retrieved successfully",
      materials: result,
    });
  } catch (e) {
    next(e);
  }
};

const deleteMaterial = async (req: Request, res: Response, next: NextFunction) => {
  try {
    await MaterialService.deleteMaterial(req.params?.id as string, req.user?.id as string);
    res.status(200).json({
      status: "success",
      message: "Material deleted successfully",
    });
  } catch (e) {
    next(e);
  }
};

// Return the material's AI summary, generating it the first time it is asked
// for. `{ regenerate: true }` is accepted from the course's tutor only.
const summarise = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await MaterialSummaryService.getOrCreateSummary(
      req.params?.id as string,
      req.user?.id as string,
      { regenerate: req.body?.regenerate === true },
    );
    res.status(200).json({
      status: "success",
      message: result.cached ? "Summary retrieved" : "Summary generated",
      ...result,
    });
  } catch (e) {
    next(e);
  }
};

export const MaterialController = {
  createMaterial,
  getMaterials,
  deleteMaterial,
  summarise,
};
