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

/**
 * Ask the API whether this user may open the slot's whiteboard, and get the
 * room id if so. The room id is not derivable on the client — this call is the
 * only way to obtain it, which is what keeps the board private.
 */
export const getWhiteboardAccess = async (slotId: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/whiteboard/${slotId}/access`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    cache: "no-store",
  })
  // { status, roomId, title, isOwner } on success, { message } on refusal.
  return res.json()
}

/** Tutor only — file an exported image of the board under the course's materials. */
export const saveWhiteboardSnapshot = async (
  slotId: string,
  file_url: string,
  title?: string,
) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/whiteboard/${slotId}/snapshot`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify({ file_url, title }),
  })
  return res.json()
}
