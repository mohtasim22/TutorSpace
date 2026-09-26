"use server";
import { SERVER_API as API } from "@/lib/api"

import { cookies } from "next/headers"
const getCookieHeader = async () => {
  const cookieStore = await cookies()
  return cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
}

export const createCourse = async (payload: {
  name: string
  description: string
}) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/courses`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(payload),
  })
  const result = await res.json();
  return result;
}

export const updateCourse = async (
  courseId: string,
  payload: { name?: string; description?: string }
) => {
  const cookieHeader = await getCookieHeader()
  const res = await fetch(`${API}/courses/${courseId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(payload),
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

export const getAllCoursesByTutorId = async (id: string) => {
  try {
    const res = await fetch(`${API}/courses/${id}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    const result = await res.json();
    return result;

  } catch (error) {
    console.error("course request failed:", error)
    throw new Error("Could not load courses. Please try again.")
  }
};