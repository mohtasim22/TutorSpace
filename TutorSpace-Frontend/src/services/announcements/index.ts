"use server"
import { SERVER_API as API } from "@/lib/api"

import { cookies } from "next/headers"


const getCookieHeader = async () => {
  const cookieStore = await cookies()
  return cookieStore
    .getAll()
    .map((c) => `${c.name}=${c.value}`)
    .join("; ")
}

// Role-aware feed (tutor -> their courses, student -> booked courses).
export const getAnnouncements = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/announcements`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    cache: "no-store",
  })
  const result = await res.json()
  return result?.announcements ?? []
}

// TUTOR: post a short announcement to a course.
export const createAnnouncement = async (payload: {
  message: string
  course_id: string
}) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/announcements`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify(payload),
  })
  return res.json()
}

// TUTOR: delete an announcement.
export const deleteAnnouncement = async (id: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/announcements/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
  })
  return res.json()
}
