"use server";
import { SERVER_API as API } from "@/lib/api"

import { cookies } from "next/headers";
const getCookieHeader = async () => {
  const cookieStore = await cookies()
  return cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
}

const formatDateTime = (date: string, time: string) => {
  const [year, month, day] = date.split("-").map(Number)
  const [hours, minutes] = time.split(":").map(Number)
  const d = new Date(year, month - 1, day, hours, minutes, 0)
  return d.toISOString()
}

export const createSlot = async (payload: {
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  meeting_link: string
  course_id: string
  session_type: "ONE_ON_ONE" | "GROUP"
  capacity: number
}) => {
  const cookieHeader = await getCookieHeader()

  const formattedPayload = {
    name: payload.name,
    description: payload.description,
    meeting_link: payload.meeting_link,
    course_id: payload.course_id,
    // Carry the session type and seat count through to the backend. Omitting
    // these was silently forcing every slot to the schema defaults
    // (ONE_ON_ONE, capacity 1).
    session_type: payload.session_type,
    capacity: payload.capacity,
    date: new Date(payload.date).toISOString(),
    start_time: formatDateTime(payload.date, payload.start_time),
    end_time: formatDateTime(payload.date, payload.end_time),
  }

  const res = await fetch(`${API}/slots`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(formattedPayload),
  })
  return res.json()
}

export const updateSlot = async (slotId: string, payload: Partial<{
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  meeting_link: string
  course_id: string
  session_type: "ONE_ON_ONE" | "GROUP"
  capacity: number
}>) => {
  const cookieHeader = await getCookieHeader()

  const formattedPayload = {
    ...(payload.name && { name: payload.name }),
    ...(payload.description && { description: payload.description }),
    ...(payload.meeting_link && { meeting_link: payload.meeting_link }),
    ...(payload.course_id && { course_id: payload.course_id }),
    ...(payload.session_type && { session_type: payload.session_type }),
    // Use != null so a valid capacity of 0 wouldn't be dropped (defensive;
    // capacity is always >= 1 in practice).
    ...(payload.capacity != null && { capacity: payload.capacity }),
    ...(payload.date && { date: new Date(payload.date).toISOString() }),
    ...(payload.date && payload.start_time && {
      start_time: formatDateTime(payload.date, payload.start_time),
    }),
    ...(payload.date && payload.end_time && {
      end_time: formatDateTime(payload.date, payload.end_time),
    }),
  }

  const res = await fetch(`${API}/slots/${slotId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(formattedPayload),
  })
  return res.json()
}



export const getAllCourseSlots = async () => {
  try {

    const res = await fetch(`${API}/slots/allslots`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json"
      },
    });

    const result = await res.json();
    return result;
  } catch (error) {
    console.error("slot request failed:", error)
    throw new Error("Could not load sessions. Please try again.")
  }
};

export const getSingleSlot = async (id: string) => {
  try {
    const cookieHeader = await getCookieHeader()

    const res = await fetch(`${API}/slots/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Cookie: cookieHeader,
        },
        cache: "no-store"
      },
    );



    const result = await res.json();
    return result;
  } catch (error: any) {
    // `return Error(...)` created an Error object and handed it back as data
    // instead of signalling failure, so callers silently treated it as a slot.
    console.error("getSingleSlot failed:", error)
    throw new Error("Could not load this session. Please try again.")
  }
};
export const getSlotByTutor = async (id: string) => {
  try {
    const res = await fetch(`${API}/slots/tutor/${id}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store"
      },
    );

    const result = await res.json();

    return result;
  } catch (error: any) {
    console.error("getSlotByTutor failed:", error)
    throw new Error("Could not load your sessions. Please try again.")
  }
};


export const deleteSlot = async (slotId: string) => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/slots/${slotId}`, {
    method: "DELETE",
    headers: {
      Cookie: cookieHeader,
    },
  })
  return res.json()
}