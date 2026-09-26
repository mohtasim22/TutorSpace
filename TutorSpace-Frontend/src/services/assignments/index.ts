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

// TUTOR: create a new assignment for one of their courses.
export const createAssignment = async (payload: {
  title: string
  description: string
  due_date?: string | null
  course_id: string
}) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/assignments`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify(payload),
  })
  return res.json()
}

// Role-aware list (tutor -> their assignments, student -> booked courses).
export const getAssignments = async () => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/assignments`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    cache: "no-store",
  })
  const result = await res.json()
  return result?.assignments ?? []
}

// TUTOR: one assignment with all its submissions.
export const getAssignmentById = async (id: string) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/assignments/${id}`, {
    method: "GET",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    cache: "no-store",
  })
  const result = await res.json()
  return result?.assignment ?? null
}

// STUDENT: submit (or re-submit) work — file_url comes from Cloudinary.
export const submitAssignment = async (
  assignmentId: string,
  payload: { file_url: string; note?: string }
) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/assignments/${assignmentId}/submit`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Cookie: cookieHeader },
    body: JSON.stringify(payload),
  })
  return res.json()
}

// TUTOR: grade a submission.
export const gradeSubmission = async (
  submissionId: string,
  payload: { grade: number; feedback?: string }
) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(
    `${API}/assignments/submissions/${submissionId}/grade`,
    {
      method: "PATCH",
      headers: { "Content-Type": "application/json", Cookie: cookieHeader },
      body: JSON.stringify(payload),
    }
  )
  return res.json()
}
