"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Star, MessageSquare, Calendar } from "lucide-react"
import {
  TableView,
  CardView,
  MobileCard,
  Field,
} from "@/components/shared/responsiveTable"

type Review = {
  id: string
  rating: number
  comment?: string
  status: string
  createdAt: string
  student: {
    name: string
    email: string
  }
  booking: {
    courseSlot: {
      name: string
      description: string
      date: string
    }
  }
}

interface Props {
  reviews: Review[]
  ratingAvg: number
  totalReviews: number
}

const DisplayStars = ({ rating }: { rating: number }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((star) => (
      <Star
        key={star}
        className={`h-4 w-4 ${
          star <= rating
            ? "text-yellow-400 fill-yellow-400"
            : "text-muted-foreground"
        }`}
      />
    ))}
  </div>
)


export default function TutorReviewsPage({ reviews, ratingAvg, totalReviews }: Props) {
  const [filter, setFilter] = useState<string>("ALL")

  const filteredReviews = filter === "ALL"
    ? reviews
    : reviews.filter((r) => r.rating === parseInt(filter))

  const ratingCounts = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    percentage: reviews.length
      ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
      : 0,
  }))

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-0 sm:px-4 space-y-6">
      <h1 className="text-xl sm:text-2xl font-bold">Reviews & Ratings</h1>

      {/* Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

        {/* Overall Rating */}
        <Card>
          <CardContent className="pt-6 flex items-center gap-6">
            <div className="text-center">
              <div className="text-5xl font-bold">{ratingAvg}</div>
              <DisplayStars rating={Math.round(ratingAvg)} />
              <p className="text-xs text-muted-foreground mt-1">
                {totalReviews} reviews
              </p>
            </div>
            <div className="flex-1 space-y-1">
              {ratingCounts.map(({ star, count, percentage }) => (
                <div key={star} className="flex items-center gap-2 text-xs">
                  <span className="w-3">{star}</span>
                  <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  <div className="flex-1 bg-muted rounded-full h-2">
                    <div
                      className="bg-yellow-400 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="w-6 text-muted-foreground">{count}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-4">
          {[5, 4, 3, 2].map((star) => (
            <Card key={star}>
              <CardContent className="pt-6">
                <div className="text-2xl font-bold">
                  {reviews.filter((r) => r.rating === star).length}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  {Array.from({ length: star }).map((_, i) => (
                    <Star key={i} className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                  ))}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Reviews Table */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            All Reviews
          </CardTitle>
          {/* Filter */}
          <Select value={filter} onValueChange={setFilter}>
            <SelectTrigger className="w-36">
              <SelectValue placeholder="Filter by rating" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All Ratings</SelectItem>
              <SelectItem value="5">5 Stars</SelectItem>
              <SelectItem value="4">4 Stars</SelectItem>
              <SelectItem value="3">3 Stars</SelectItem>
              <SelectItem value="2">2 Stars</SelectItem>
              <SelectItem value="1">1 Star</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          {filteredReviews.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No reviews found.
            </div>
          ) : (
            <>
            <TableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Student</TableHead>
                  <TableHead>Slot</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead>Rating</TableHead>
                  <TableHead>Comment</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredReviews.map((review) => (
                  <TableRow key={review.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{review.student.name}</div>
                      <div className="text-xs text-muted-foreground">{review.student.email}</div>
                    </TableCell>
                    <TableCell>
                      <div className="text-sm font-medium">
                        {review.booking.courseSlot.name}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {review.booking.courseSlot.description}
                      </div>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(review.booking.courseSlot.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell>
                      <DisplayStars rating={review.rating} />
                    </TableCell>
                    <TableCell className="max-w-xs">
                      {review.comment ? (
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {review.comment}
                        </p>
                      ) : (
                        <span className="text-xs text-muted-foreground">—</span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={review.status === "APPROVED" ? "default" : "secondary"}
                      >
                        {review.status}
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableView>

            {/* Phones: one card per review. Six columns cannot be read at this
                width without swiping, and the comment is the point of the row. */}
            <CardView>
              {filteredReviews.map((review) => (
                <MobileCard key={review.id}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <div className="text-sm font-medium truncate">
                        {review.student.name}
                      </div>
                      <div className="text-xs text-muted-foreground break-all">
                        {review.student.email}
                      </div>
                    </div>
                    <Badge variant={review.status === "APPROVED" ? "default" : "secondary"}>
                      {review.status}
                    </Badge>
                  </div>

                  <Field label="Session">
                    {review.booking.courseSlot.name}
                  </Field>
                  <Field label="Date">
                    {new Date(review.booking.courseSlot.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Field>
                  <Field label="Rating">
                    <DisplayStars rating={review.rating} />
                  </Field>

                  {review.comment && (
                    <p className="text-sm text-muted-foreground border-t pt-2">
                      {review.comment}
                    </p>
                  )}
                </MobileCard>
              ))}
              {filteredReviews.length === 0 && (
                <p className="py-8 text-center text-sm text-muted-foreground">
                  No reviews to show.
                </p>
              )}
            </CardView>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}