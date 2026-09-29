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
 * Generate a practice quiz from a PDF material. For a student the quiz is
 * private to them; for a tutor it is stored as an unpublished course draft.
 */
export const generatePracticeSet = async (materialId: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/practice/generate/${materialId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
  })
  return res.json()
}

export const getPracticeSets = async () => {
  try {
    const cookieHeader = await getCookieHeader()
    const res = await fetch(`${API}/practice`, {
      method: "GET",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      cache: "no-store",
    })
    const result = await res.json()
    // Unwrapped here, like getMaterials, so pages receive the array directly.
    return result?.practiceSets ?? []
  } catch (error) {
    console.error("getPracticeSets failed:", error)
    throw new Error("Could not load practice sets. Please try again.")
  }
}

export const updatePracticeSet = async (
  id: string,
  payload: { title?: string; questions?: unknown[]; is_published?: boolean },
) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/practice/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify(payload),
  })
  return res.json()
}

export const deletePracticeSet = async (id: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/practice/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
  })
  return res.json()
}
