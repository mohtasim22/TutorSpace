"use server"
import { SERVER_API as API } from "@/lib/api"

import { cookies } from "next/headers"


const getCookieHeader = async () => {
  const cookieStore = await cookies()
  return cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
}

export const getAdminStats = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/admin/stats`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })
  return res.json()
}

export const getAllUsers = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/admin/users`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })
  return res.json()
}

export const updateUserStatus = async (userId: string, status: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/admin/users/${userId}/status`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ status }),
  })
  return res.json()
}

export const getAllAdminCourses = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/courses`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })
  return res.json()
}

export const updateCourseStatus = async (courseId: string, status: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/courses/${courseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ status }),
  })
  return res.json()
}

export const deleteCourse = async (courseId: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/courses/${courseId}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  })
  return res.json()
}

export const getAllAdminReviews = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/review`, {
    headers: { Cookie: cookieHeader },
    cache: "no-store",
  })
  return res.json()
}

export const updateReviewStatus = async (
  reviewId: string,
  status: "APPROVED" | "REJECTED"
) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/review/${reviewId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ status }),
  })
  return res.json()
}

export const adminDeleteReview = async (reviewId: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/review/${reviewId}`, {
    method: "DELETE",
    headers: { Cookie: cookieHeader },
  })
  return res.json()
}

export const verifyTutor = async (tutorId: string, is_verified: boolean) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/tutors/${tutorId}/verify`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify({ is_verified }),
  })
  return res.json()
}