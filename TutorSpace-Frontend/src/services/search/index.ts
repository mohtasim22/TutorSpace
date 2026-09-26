"use server"
import { SERVER_API as API } from "@/lib/api"


// Public search across tutors and courses.
export const searchAll = async (q: string) => {
  const res = await fetch(`${API}/search?q=${encodeURIComponent(q)}`, {
    method: "GET",
    headers: { "Content-Type": "application/json" },
    cache: "no-store",
  })
  return res.json() // { status, tutors, courses }
}
