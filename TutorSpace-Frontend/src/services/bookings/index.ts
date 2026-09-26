"use server"
import { SERVER_API as API } from "@/lib/api"

import { cookies } from "next/headers"
const getCookieHeader = async () => {
  const cookieStore = await cookies()
  return cookieStore.getAll().map(c => `${c.name}=${c.value}`).join('; ')
}

export const createBooking = async (payload: {
  course_slot_id: string
  tutor_id: string
}) => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/booking`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    body: JSON.stringify(payload),
  })
  const result = await res.json()
  return result
}


export const getBookings = async () => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/booking`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })

  const result = await res.json()
  // Return the array from the response (handle both { data: [...] } and direct array)
  return Array.isArray(result) ? result : (result?.data || [])
}

export const getTutorBookings = async () => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/booking`, {
    method: "GET",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
    cache: "no-store",
  })

  const result = await res.json()
  return Array.isArray(result) ? result : (result?.data || [])
}

export const updateBookingStatus = async (
  bookingId: string,
  status: "CONFIRMED" | "CANCELLED" | "PENDING" | "COMPLETED"
) => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(
    `${API}/booking/${bookingId}`,
    {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ booking_status: status }),
    }
  )
  const data = await res.json()
  return data
}

export const createCheckoutSession = async (bookingId: string) => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(
    `${API}/payments/create-checkout-session`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Cookie: cookieHeader,
      },
      body: JSON.stringify({ bookingId }),
    }
  )
  const data = await res.json()
  return data
}

/**
 * Cancel a booking. The API applies the refund policy and reports what it did
 * — the response carries `refunded` so the caller can confirm the outcome
 * rather than guess it.
 */
export const cancelBooking = async (bookingId: string) => {
  const cookieHeader = await getCookieHeader()

  const res = await fetch(`${API}/booking/${bookingId}/cancel`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Cookie: cookieHeader,
    },
  })
  return res.json()
}
