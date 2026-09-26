import { NextFunction, Request, Response } from "express";
import { SearchService } from "./search.service";

const search = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const result = await SearchService.searchAll((req.query.q as string) ?? "");
    res.status(200).json({ status: "success", ...result });
  } catch (e) {
    next(e);
  }
};

export const SearchController = { search };
