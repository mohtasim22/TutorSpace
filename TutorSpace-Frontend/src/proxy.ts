import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { SERVER_API, SESSION_HEADER } from "@/lib/api";

const PUBLIC_ROUTES = ["/", "/login", "/register"];
const ALLOWED_ROLES = ["STUDENT", "ADMIN", "TUTOR"];

export default async function middleware(request: NextRequest) {
  const { pathname, origin } = request.nextUrl;

  const isPublic = PUBLIC_ROUTES.some(
    (r) => pathname === r || pathname.startsWith(r + "/")
  );

  if (isPublic) return NextResponse.next();

  let user = null;
  try {
    const res = await fetch(
      // Call the API directly rather than through the /api/v1 rewrite. This
      // runs on every dashboard navigation, so proxying it through our own
      // server cost a second round trip on the critical path of every click.
      `${SERVER_API}/auth/get-session`,
      {
        headers: { cookie: request.headers.get("cookie") || "" },
        // Session checks must never be cached.
        cache: "no-store",
      }
    );
    if (res.ok) {
      const data = await res.json();
      user = data?.user ?? null;
    }
  } catch {
    user = null;
  }

  if (!user) {
    return NextResponse.redirect(
      new URL(`/login?redirect=${pathname}`, origin)
    );
  }

  if (!ALLOWED_ROLES.includes(user.role)) {
    return NextResponse.redirect(new URL("/login", origin));
  }

  // Hand the validated session forward so the layout and pages rendering this
  // same request don't each repeat the lookup. Set unconditionally — that is
  // what makes any client-supplied value of this header irrelevant.
  const forwarded = new Headers(request.headers);
  forwarded.set(
    SESSION_HEADER,
    JSON.stringify({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      image: user.image ?? null,
      status: user.status ?? "ACTIVE",
    }),
  );

  return NextResponse.next({ request: { headers: forwarded } });
}

export const config = {
  matcher: ["/dashboard/:path*"],
};