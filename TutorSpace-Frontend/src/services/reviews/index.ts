
"use server"
import { SERVER_API as API } from "@/lib/api"

import { cookies } from "next/headers"
const getCookieHeader = async () => {
  const cookieStore = await cookies()
  return cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
}

export const createReview = async (payload: {
  booking_id: string
  tutor_id: string
  rating: number
  comment?: string
}) => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/review`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(payload),
  })
  return res.json()
}


export const getTutorReviews = async () => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/review`, {
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })
  return res.json()
}

// services/reviews/index.ts
export const getTutorReviewsById = async (tutorId: string) => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(
    `${API}/review/${tutorId}`,

    {
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      cache: "no-store"
    }
  )
  const result = await res.json();
  return result
}

export const updateReview = async (
  reviewId: string,
  payload: { rating?: number; comment?: string }
) => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/review/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export const getPublicTutorReviews = async (tutorId: string) => {
  const res = await fetch(
    `${API}/review/tutor/${tutorId}/public`,
    { cache: "no-store" }
  )
  const result = await res.json();
  return result
}