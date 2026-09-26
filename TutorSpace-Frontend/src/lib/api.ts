/**
 * Base URL for API calls made from the SERVER (Server Components, Server
 * Actions, middleware).
 *
 * Why this exists
 * ---------------
 * The browser talks to the API through the `/api/v1/*` rewrite in
 * next.config.ts. That rewrite is deliberate: it makes the API look
 * same-origin to the browser, so Better Auth's session cookie is a plain
 * first-party cookie and needs no cross-site attributes in development.
 *
 * Server-side code has no such need — it forwards the session cookie by hand
 * as a `Cookie` header. Routing those calls through the rewrite meant the
 * Next.js server issued an HTTP request to ITSELF and then proxied onward to
 * Express, so every server-side call paid for two round trips instead of one,
 * while the same process was busy rendering.
 *
 * So: the browser keeps using the rewrite, and the server goes straight to
 * `API_BASE`. `NEXT_PUBLIC_APP_URL` remains the fallback for any environment
 * where `API_BASE` has not been configured, which preserves the previous
 * behaviour rather than failing.
 *
 * Note that `API_BASE` should point at the API origin only (no path) — for
 * example `http://127.0.0.1:5000` locally, or the deployed API origin in
 * production. Prefer `127.0.0.1` over `localhost` for the local value: on
 * Windows, `localhost` resolves to IPv6 `::1` first, and if Express is bound
 * to IPv4 only, Node stalls on the failed attempt before retrying.
 */
export const SERVER_API = `${process.env.API_BASE ?? process.env.NEXT_PUBLIC_APP_URL}/api/v1`

/**
 * Internal header the middleware uses to hand the already-validated session to
 * the Server Components rendering the same request, so the session is not
 * looked up again. Set unconditionally by the middleware on every route it
 * matches, so a value sent by a client is always replaced.
 */
export const SESSION_HEADER = "x-tutorspace-user"
