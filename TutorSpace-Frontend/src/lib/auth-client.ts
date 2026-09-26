import { createAuthClient } from "better-auth/react";

/**
 * Origin the browser should talk to for auth.
 *
 * This runs in the browser, so it must be the origin the user is ACTUALLY on.
 * Deriving it from `window.location.origin` rather than from an environment
 * variable removes a whole class of bug: if the env var said `127.0.0.1:3000`
 * while the user had typed `localhost:3000` (or the reverse), every auth call
 * would be cross-origin, and the session cookie — which is scoped to the
 * origin that set it — would silently not be sent. The result is a login that
 * appears to succeed and then behaves as though the user is signed out.
 *
 * The env var remains the fallback for the server-render pass, where there is
 * no `window`.
 */
const browserOrigin =
    typeof window !== "undefined"
        ? window.location.origin
        : process.env.NEXT_PUBLIC_APP_URL;

export const authClient = createAuthClient({
    // Same-origin, so the /api/v1 rewrite in next.config.ts forwards this to
    // the API and the cookie comes back as a first-party cookie.
    baseURL: `${browserOrigin}/api/v1/auth`,
    fetchOptions: { credentials: "include" },
});

export const signInWithGoogle = async () => {
    return await authClient.signIn.social({
        provider: "google",
        callbackURL: `${browserOrigin}/dashboard`,
    });
};
