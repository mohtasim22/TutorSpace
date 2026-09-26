import express from "express";
import { SearchController } from "./search.controller";

const router = express.Router();

// Public — no auth needed to search tutors/courses.
router.get("/", SearchController.search);

export const searchRouter = router;
