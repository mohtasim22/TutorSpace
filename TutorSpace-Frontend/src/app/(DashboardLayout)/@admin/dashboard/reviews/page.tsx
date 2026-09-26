import AdminReviewsPage from "@/components/modules/admin/AdminReviewsPage"
import { getAllAdminReviews } from "@/services/admin"

export default async function ReviewsPage() {
  const { reviews } = await getAllAdminReviews()
  return <AdminReviewsPage initialReviews={reviews ?? []} />
}