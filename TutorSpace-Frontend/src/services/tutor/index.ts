"use server";
import { SERVER_API as API } from "@/lib/api"

import { cookies } from "next/headers";
import { FieldValues } from "react-hook-form";
const getCookieHeader = async () => {
  const cookieStore = await cookies()
  return cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
}

export const getAllTutors = async () => {
  try {
    const res = await fetch(`${API}/tutors`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
      cache: "no-store"
    });

    const result = await res.json();

    return result;

  } catch (error) {
    // Rethrow so the route's error boundary renders a real failure state.
    // Swallowing this made an unreachable API indistinguishable from an
    // empty result — the page said "nothing here" when it meant "couldn't ask".
    console.error("getAllTutors failed:", error)
    throw new Error("Could not load tutors. Please try again.")
  }
};

export const getTutorProfile = async ({
  userId,
  tutorId,
}: {
  userId?: string;
  tutorId?: string;
}) => {
  const query = userId ? `userId=${userId}` : `tutorId=${tutorId}`;

  try {
    const res = await fetch(`${API}/tutors/single?${query}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });
    const result = await res.json();

    return result;
  } catch (error) {
    console.error("getTutorProfile failed:", error)
    throw new Error("Could not load the tutor profile. Please try again.")
  }
};


export const updateTutorProfile = async (updatedData: FieldValues) => {
  try {
    const cookieHeader = await getCookieHeader()

    const res = await fetch(`${API}/tutors/profile`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify(updatedData),
    });

    const result = await res.json();
    return result;
  } catch (error) {
    // A mutation, not a page render — the caller shows a toast, so return a
    // shaped error rather than throwing. Returning undefined left the caller
    // with nothing to display but a generic "something went wrong".
    console.error("updateTutorProfile failed:", error)
    return { status: "error", message: "Could not save your profile. Please try again." }
  }
};


export const createTutorProfile = async (payload: {
  display_name: string
  bio: string
  qualification: string
}) => {
  // The API now identifies the account from the session rather than from an
  // email address in the body, so the session cookie must be forwarded.
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/tutors`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Cookie": cookieHeader,
    },
    body: JSON.stringify(payload)
  })
  const result = await res.json();
  return result;
}