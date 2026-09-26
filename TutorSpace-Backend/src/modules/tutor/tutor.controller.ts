import { NextFunction, Request, Response } from "express";
import { tutorService } from "./tutor.service";

const createTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await tutorService.createTutorIntoDB(req.body, req.user?.id as string);

        res.status(201).json({
            status: "success",
            message: "Tutor profile created successfully",
            tutor: result
        })
    } catch (e) {

        next(e);
    }
}
const getAllTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { minPrice, maxPrice, course } = req.query;
        const filters: any = {};
        if (minPrice) filters.minPrice = parseFloat(minPrice as string);
        if (maxPrice) filters.maxPrice = parseFloat(maxPrice as string);
        if (course) filters.course = course as string;

        const result = await tutorService.getAllTutor(filters);
        res.status(201).json({
            status: "success",
            message: "Tutor retrieved successfully",
            tutor: result
        })
    } catch (e) {
        next(e);
    }
}
const getTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const { userId, tutorId } = req.query;

        if (!userId && !tutorId) {
            res.status(400).json({
                status: "error",
                message: "Provide either userId or tutorId",
            });
            return;
        }

        const result = await tutorService.getTutorService({
            userId: userId as string,
            tutorId: tutorId as string,
        });

        if (!result) {
            res.status(404).json({
                status: "error",
                message: "Tutor not found",
            });
            return;
        }

        res.status(201).json({
            status: "success",
            message: "Tutor retrieved successfully",
            tutor: result
        })
    } catch (e) {
        next(e);
    }
}

const updateTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {

        const result = await tutorService.updateTutor(req.body,
            req.user?.id as string,
            req.params?.id as string)

        res.status(200).json({
            status: "success",
            message: "Tutor profile updated successfully",
            tutor: result,
        })
    } catch (e) {
        next(e)
    }
}

const deleteTutor = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await tutorService.deleteTutor(req.params?.id as string, req.user?.id as string);
        res.status(201).json({
            status: "success",
            message: "Tutor deleted successfully",
            user: result
        })
    } catch (e) {
        next(e);
    }
}

export const tutorController = {
    createTutor,
    getAllTutor,
    updateTutor,
    getTutor,
    deleteTutor
}
// End of tutor controller handlers

// tutor endpoints final
