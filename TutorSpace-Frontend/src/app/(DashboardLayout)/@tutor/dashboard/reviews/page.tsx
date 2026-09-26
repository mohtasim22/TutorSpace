// @tutor/dashboard/reviews/page.tsx
import TutorReviewsPage from "@/components/modules/reviews/TutorReviewsPage"
import { getTutorReviews } from "@/services/reviews"
import { getTutorProfile } from "@/services/tutor"
import { getUser } from "@/services/auth"

export default async function TutorReviewsRoute() {
  const user = await getUser()
  const [{ reviews }, { tutor }] = await Promise.all([
    getTutorReviews(),
    getTutorProfile({ userId: user?.id }),
  ])

  return (
    <TutorReviewsPage
      reviews={reviews ?? []}
      ratingAvg={tutor?.rating_avg ?? 0}
      totalReviews={tutor?.total_reviews ?? 0}
    />
  )
}