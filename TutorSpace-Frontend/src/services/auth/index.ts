"use server";
import { SERVER_API as API } from "@/lib/api"
import { revalidatePath } from "next/cache";
import { cookies, headers } from "next/headers";
import { SESSION_HEADER } from "@/lib/api";

/**
 * The current user.
 *
 * On /dashboard routes the middleware has already validated the session for
 * this request, and passes the resolved user forward on an internal header. We
 * read that instead of asking the API again.
 *
 * This matters because the database is hosted in another region: a session
 * lookup is a full Next → Express → Postgres round trip, and it was happening
 * two or three times per navigation (middleware, then the dashboard layout,
 * then most pages) for data that cannot have changed in between.
 *
 * On public routes the middleware does not run, so there is no header and we
 * fall back to asking the API.
 *
 * The header is not a trust boundary. The middleware sets it unconditionally on
 * every matched request, so a value supplied by a client is always overwritten;
 * and it only decides which interface is rendered. Every piece of data on the
 * page is fetched with the session cookie and authorised independently by the
 * API, which is what actually protects it.
 */
export const getUser = async () => {
  try {
    const headerStore = await headers();
    const forwarded = headerStore.get(SESSION_HEADER);
    if (forwarded) {
      try {
        return JSON.parse(forwarded);
      } catch {
        // Malformed — fall through to the authoritative lookup below.
      }
    }
  } catch {
    // No request scope (e.g. during a build) — fall through.
  }

  try {
    const storeCookie = await cookies();
    const cookieHeader = storeCookie.getAll().map(c => `${c.name}=${c.value}`).join('; ');

    const res = await fetch(`${API}/auth/get-session`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        "Cookie": cookieHeader,
      },
      cache: "no-store",
    });

    if (!res.ok) return null;

    const data = await res.json();
    return data?.user || null;
  } catch (error) {
    return null;
  }
};

// export const updateUserProfile = async (updatedData: { name?: string }) => {
//   try {
//     const storeCookie = await cookies();
//     const cookieHeader = storeCookie.getAll().map(c => `${c.name}=${c.value}`).join('; ');

//     const res = await fetch(`${API}/auth/update-user`, {
//       method: "POST",
//       headers: {
//         "Content-Type": "application/json",
//         "Cookie": cookieHeader,
//       },
//       body: JSON.stringify(updatedData),
//     });

//     const result = await res.json();

//     if (res.ok) {
//       revalidatePath("/dashboard/profile");
//       return { status: "success", user: result.user || result };
//     }

//     return { status: "error", message: result.message || "Failed to update profile" };
//   } catch (error) {
//     return { status: "error", message: "Failed to update profile" };
//   }
// };