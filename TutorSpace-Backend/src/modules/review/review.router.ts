import express from "express";
import auth, { UserRole } from "../../middlewares/auth";
import { reviewController } from "./review.controller";
import { validateRequest } from "../../middlewares/validateRequest";
import { createReviewSchema, updateReviewSchema } from "./review.validation";

const router = express.Router();

router.post("/", auth(UserRole.student), validateRequest(createReviewSchema), reviewController.createReview)
router.get("/",auth(UserRole.student, UserRole.tutor, UserRole.admin),  reviewController.getAllReviews)
router.get("/:id",auth(UserRole.student, UserRole.tutor, UserRole.admin),  reviewController.getTutorReviewsById)

router.get("/tutor/:id/public", reviewController.getPublicTutorReviews)

// Admin-only on-demand regeneration. The scheduled pass handles the normal
// case; this exists so a summary can be produced without waiting for cron.
router.post("/tutor/:id/summary", auth(UserRole.admin), reviewController.refreshReviewSummary)

router.patch("/:id", auth(UserRole.student, UserRole.admin), validateRequest(updateReviewSchema), reviewController.updateReview)
router.delete("/:id",auth(UserRole.student, UserRole.admin), reviewController.deleteReview)

export const reviewRouter = router;