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

// The current user's latest notifications + unread count.
export const getNotifications = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/notifications`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    cache: "no-store",
  })
  return res.json() // { status, notifications, unread }
}

// Mark all of the user's notifications as read.
export const markNotificationsRead = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/notifications/read`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
  })
  return res.json()
}
