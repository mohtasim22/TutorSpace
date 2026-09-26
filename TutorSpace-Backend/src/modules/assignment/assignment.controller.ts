import { NextFunction, Request, Response } from "express";
import { AssignmentService } from "./assignment.service";

const createAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AssignmentService.createAssignment(req.body, req.user?.id as string);
    res.status(201).json({
      status: "success",
      message: "Assignment created successfully",
      assignment: result,
    });
  } catch (e) {
    next(e);
  }
};

const getAssignments = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AssignmentService.getAssignments(req.user?.id as string);
    res.status(200).json({
      status: "success",
      message: "Assignments retrieved successfully",
      assignments: result,
    });
  } catch (e) {
    next(e);
  }
};

const getAssignmentById = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AssignmentService.getAssignmentById(
      req.params?.id as string,
      req.user?.id as string,
    );
    res.status(200).json({
      status: "success",
      message: "Assignment retrieved successfully",
      assignment: result,
    });
  } catch (e) {
    next(e);
  }
};

const submitAssignment = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AssignmentService.submitAssignment(
      req.params?.id as string,
      req.body,
      req.user?.id as string,
    );
    res.status(201).json({
      status: "success",
      message: "Submission saved successfully",
      submission: result,
    });
  } catch (e) {
    next(e);
  }
};

const gradeSubmission = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await AssignmentService.gradeSubmission(
      req.params?.id as string,
      req.body,
      req.user?.id as string,
    );
    res.status(200).json({
      status: "success",
      message: "Submission graded successfully",
      submission: result,
    });
  } catch (e) {
    next(e);
  }
};

export const AssignmentController = {
  createAssignment,
  getAssignments,
  getAssignmentById,
  submitAssignment,
  gradeSubmission,
};
