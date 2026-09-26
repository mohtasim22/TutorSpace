import { NextFunction, Request, Response } from "express";
import { adminService } from "./admin.service";


const getAllUsers = async( req: Request, res: Response, next: NextFunction)=>{
    try{
        const result = await adminService.getAllUsers(req.user?.id,);
        res.status(201).json(result)
    } catch (e){
        next(e);
    }
}
const updateUserStatus = async( req: Request, res: Response, next: NextFunction)=>{
    try {
    const { status } = req.body;
    const result = await adminService.updateUserStatus(req.params.id as string, status);
    res.status(200).json({
      status: "success",
      message: "User status updated successfully",
      user: result,
    });
  } catch (e) {
    next(e);
  }
}

export const getAdminStats = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const result = await adminService.getAdminStats();
    res.status(200).json({
      status: "success",
      message: "Stats retrieved successfully",
      stats: result,
    });
  } catch (e) {
    next(e);
  }
};

export const adminController ={
    getAllUsers,
    updateUserStatus,
    getAdminStats
}