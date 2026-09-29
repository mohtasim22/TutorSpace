import { NextFunction, Request, Response } from "express";
import { reviewService } from "./review.service";

const createReview = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await reviewService.createReviewIntoDB(req.body, req.user?.id);
        res.status(200).json({
            status: "success",
            message: "Review created successfully",
            review: result
        })
    } catch (e){
        next(e);
    }
} 

const getAllReviews = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await reviewService.getAllReviews(req.user?.id);
        res.status(201).json({
            status: "success",
            message: "Reviews retrieved successfully",
            reviews: result
        })
    } catch (e){
        next(e);
    }
} 
const getTutorReviewsById = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await reviewService.getTutorReviewsById(req.params?.id as string ,req.user?.id);
        res.status(201).json({
            status: "success",
            message: "Reviews retrieved successfully",
            reviews: result
        })
    } catch (e){
        next(e);
    }
} 

const updateReview = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await reviewService.updateReview(req.params?.id as string, req.body, req.user?.id as string);    
        res.status(201).json({
            status: "success",
            message: "Review updated successfully",
            review: result
        })
    } catch (e){
        next(e);
    }
}

const deleteReview = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await reviewService.deleteReview(req.params?.id as string, req.user?.id as string);
        res.status(201).json({
            status: "success",
            message: "Review deleted successfully",
            review: result
        })
    } catch (e){
        next(e);
    }
}
const getPublicTutorReviews = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await reviewService.getPublicTutorReviews(req.params?.id as string);
        res.status(201).json({
            status: "success",
            message: "Reviews retrieved successfully",
            reviews: result
        })
    } catch (e){
        next(e);
    }
}

export const reviewController = {
    createReview,
    getAllReviews,
    getTutorReviewsById,
    getPublicTutorReviews,
    updateReview,
    deleteReview,
}
// End of review and rating handlers

// reviews handlers final
