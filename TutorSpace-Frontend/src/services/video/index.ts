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

// Get (or lazily create) the video room URL for a session slot.
export const getRoom = async (slotId: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/video/${slotId}/room`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    cache: "no-store",
  })
  return res.json() // { status, url } on success, or { message } on error
}
