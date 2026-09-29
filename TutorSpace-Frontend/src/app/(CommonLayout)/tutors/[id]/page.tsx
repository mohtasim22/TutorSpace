import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { Star, GraduationCap, CheckCircle, BookOpen, Clock, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { getTutorProfile } from "@/services/tutor";
import { getAllCoursesByTutorId } from "@/services/course";
import { getSlotByTutor } from "@/services/courseSlots";
import { getPublicTutorReviews, getTutorReviewsById } from "@/services/reviews";
import BookSlotButton from "@/components/modules/tutors/BookSlotButton";
import * as motion from "framer-motion/client";
import { formatBDT, formatRate, TAKA } from "@/lib/currency"

const DisplayStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-3.5 w-3.5 ${star <= rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-muted-foreground"
          }`}
      />
    ))}
  </div>
)

export default async function TutorDetailsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const [{ tutor }, courses, { slots }, { reviews }] = await Promise.all([
    getTutorProfile({ tutorId: id }),
    getAllCoursesByTutorId(id),
    getSlotByTutor(id),
    getPublicTutorReviews(id),
  ]);

  if (!tutor) {
    return (
      <div className="max-w-3xl mx-auto py-10 px-4">
        <p className="text-muted-foreground">Tutor not found.</p>
      </div>
    )
  }

  const initials = tutor.display_name
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="min-h-screen relative">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-5%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] w-[25%] h-[25%] bg-violet-500/10 rounded-full blur-[80px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto py-20 px-4 space-y-6"
      >
        {/* Header Card */}
        <Card>
          <CardHeader className="flex flex-row items-center gap-6">
            <Avatar className="h-20 w-20 text-2xl border-2 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
              <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 space-y-1">
              <div className="flex items-center gap-2">
                <CardTitle className="text-2xl">{tutor.display_name}</CardTitle>
                {tutor.is_verified && (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <GraduationCap className="h-4 w-4" />
                {tutor.qualification.toUpperCase()}
              </p>
              <div className="flex items-center gap-2 text-sm">
                <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                <span className="font-medium">{tutor.rating_avg}</span>
                <span className="text-muted-foreground">({tutor.total_reviews} reviews)</span>
              </div>
              {tutor.hourly_rate != null && (
                <div className="flex items-center gap-1 text-sm font-semibold text-green-600">
                  {formatRate(tutor.hourly_rate)}
                </div>
              )}
            </div>
            <Badge variant={tutor.is_verified ? "default" : "secondary"}>
              {tutor.is_verified ? "Verified" : "Unverified"}
            </Badge>
          </CardHeader>
        </Card>

        {/* Bio */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">About</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {tutor.bio || "No bio provided."}
            </p>
          </CardContent>
        </Card>

        {/* Courses */}
        {courses?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Courses
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {courses.map((course: any) => (
                <div key={course.id}>
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{course.name}</span>
                    <Badge variant={course.status === "ACTIVE" ? "default" : "secondary"}>
                      {course.status}
                    </Badge>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">{course.description}</p>
                  <Separator className="mt-3" />
                </div>
              ))}
            </CardContent>
          </Card>
        )}

        {/* Reviews */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                Student Reviews
              </CardTitle>
              <Badge variant="outline">{reviews?.length ?? 0} reviews</Badge>
            </div>
          </CardHeader>
          <CardContent>
            {!reviews?.length ? (
              <p className="text-sm text-muted-foreground text-center py-4">
                No reviews yet.
              </p>
            ) : (
              <div className="space-y-4 max-h-96 overflow-y-auto pr-1">
                {reviews.map((review: any) => (
                  <div key={review.id} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Avatar className="h-7 w-7">
                          <AvatarFallback className="text-[10px]">
                            {review.student?.name?.slice(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="text-sm font-medium">{review.student?.name}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(review.createdAt).toLocaleDateString(undefined, {
                              year: "numeric",
                              month: "short",
                              day: "numeric",
                            })}
                          </p>
                        </div>
                      </div>
                      <DisplayStars rating={review.rating} />
                    </div>
                    {review.comment && (
                      <p className="text-sm text-muted-foreground pl-9">
                        {review.comment}
                      </p>
                    )}
                    <Separator />
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Slots */}
        {slots?.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="h-4 w-4" />
                Available Slots
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {slots.map((slot: any) => {
                const slotStart = new Date(slot.start_time)
                const slotEnd = new Date(slot.end_time)
                const durationHours = (slotEnd.getTime() - slotStart.getTime()) / (1000 * 60 * 60)
                const estimatedPrice = tutor.hourly_rate ? tutor.hourly_rate * durationHours : null

                return (
                  <div key={slot.id}>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-medium">{slot.name}</span>
                      <span className="text-muted-foreground">
                        {new Date(slot.date).toDateString()}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {slotStart.toLocaleTimeString()} —{" "}
                      {slotEnd.toLocaleTimeString()}
                    </p>
                    {estimatedPrice && (
                      <p className="text-sm font-semibold text-green-600 mt-1 flex items-center gap-1">
                        <span className="font-semibold">{TAKA}</span>
                        {estimatedPrice}
                      </p>
                    )}
                    <BookSlotButton slotId={slot.id} />
                    <Separator className="mt-3" />
                  </div>
                )
              })}
            </CardContent>
          </Card>
        )}
      </motion.div>
    </div>
  );
}