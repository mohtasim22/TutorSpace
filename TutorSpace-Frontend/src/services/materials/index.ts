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

// Role-aware list (tutor -> their courses, student -> booked courses).
export const getMaterials = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/materials`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    cache: "no-store",
  })
  const result = await res.json()
  return result?.materials ?? []
}

// TUTOR: save a material (file_url comes from Cloudinary).
export const createMaterial = async (payload: {
  title: string
  file_url: string
  course_id: string
}) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/materials`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify(payload),
  })
  return res.json()
}

// TUTOR: remove a material.
export const deleteMaterial = async (id: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/materials/${id}`, {
    method: "DELETE",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
  })
  return res.json()
}
