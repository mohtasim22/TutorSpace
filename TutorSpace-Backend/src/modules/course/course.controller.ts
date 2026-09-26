import { NextFunction, Request, Response } from "express";
import { courseService } from "./course.service";

const createCourse = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await courseService.createCourse(req.body, req.user?.id);
        res.status(201).json({
            status: "success",
            message: "Course created successfully",
            course: result
        })
    } catch (e){
        next(e);
    }
} 
const getAllCourses = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await courseService.getAllCourses(req.user?.id,);
        res.status(201).json({
            status: "success",
            message: "Courses fetched successfully",
            courses: result
        })
    } catch (e){
        next(e);
    }
}
const getCourseByTutorId = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await courseService.getAllCourseByTid(req.params?.id as string);
        res.status(201).json(result)
    } catch (e){
        next(e);
    }
}
const deleteCourse = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await courseService.deleteCourse(req.params?.id as string, req.user?.id as string);
        res.status(201).json({
            status: "success",
            message: "course deleted successfully",
            course: result
        })
    } catch (e){
        next(e);
    }
}
const updateCourse = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await courseService.updateCourse(req.params?.id as string, req.body, req.user?.id as string);
        res.status(201).json({
            status: "success",
            message: "course updated successfully",
            course: result
        })
    } catch (e){
        next(e);
    }
} 

export const CourseController ={
    createCourse,
    getAllCourses,
    getCourseByTutorId,
    updateCourse,
    deleteCourse
}
// End of course management controller

// course logic final
