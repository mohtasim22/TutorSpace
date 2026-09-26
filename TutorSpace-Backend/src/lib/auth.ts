import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "./prisma";
import nodemailer from "nodemailer";

// In production (Vercel sets NODE_ENV=production) cookies must be secure + cross-site.
// On local http://localhost the browser rejects secure/SameSite=None cookies, so we relax them.
const isProd = process.env.NODE_ENV === "production";

export const auth = betterAuth({
    baseURL: process.env.FRONTEND_URL,
    basePath: "/api/v1/auth",
    trustedOrigins: [
        process.env.FRONTEND_URL!,
        "http://localhost:3000",
    ],

    database: prismaAdapter(prisma, {
        provider: "postgresql",
    }),
    socialProviders: {
        google: {
            clientId: process.env.GOOGLE_CLIENT_ID as string,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET as string,
        },
    },
    emailAndPassword: {
        enabled: true,
        sendResetPassword: async ({ user, url, token }) => {
            try {
                const transporter = nodemailer.createTransport({
                    service: "gmail",
                    auth: {
                        user: process.env.SMTP_USER,
                        pass: process.env.SMTP_PASS,
                    },
                });

                const info = await transporter.sendMail({
                    from: process.env.EMAIL_FROM || '"TutorSpace" <noreply@tutorspace.com>',
                    to: user.email,
                    subject: "Reset your password - TutorSpace",
                    text: `Click the link to reset your password: ${url}. The token is ${token}.`,
                    html: `
                        <div style="font-family: sans-serif; padding: 20px; border: 1px solid #ddd; border-radius: 10px;">
                            <h2>TutorSpace 🎓</h2>
                            <p>Hi ${user.name},</p>
                            <p>You requested to reset your password. Click the button below to set a new password:</p>
                            <a href="${url}" style="display: inline-block; padding: 10px 20px; background-color: #007bff; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
                            <p>Alternatively, you can copy and paste this link into your browser:</p>
                            <p><a href="${url}">${url}</a></p>
                            <hr />
                            <p style="font-size: 0.8rem; color: #777;">If you did not request this, please ignore this email.</p>
                        </div>
                    `,
                });
            } catch (error) {
                console.error("❌ Failed to send password reset email:", error);
            }
        },
    },
    user: {
        additionalFields: {
            role: {
                type: "string",
                required: false,
                defaultValue: "STUDENT",
            },
            status: {
                type: "string",
                required: false,
                defaultValue: "ACTIVE",
            },
        },
    },
    advanced: {
        cookies: {
            session_token: {
                name: "session_token",
                attributes: {
                    httpOnly: true,
                    secure: isProd,
                    sameSite: isProd ? "none" : "lax",
                    partitioned: isProd,
                },
            },
            // The OAuth state cookie MUST NOT share a name with the session
            // cookie. Better Auth sets `state` before redirecting to the
            // provider and clears it when the provider redirects back; under a
            // shared name that cleanup deleted the session cookie the callback
            // had just set. The result was a successful Google sign-in — account
            // linked, session row written — that still bounced to /login,
            // because the browser was left holding no session token.
            // Email/password login was unaffected, since it sets no state cookie.
            state: {
                name: "oauth_state",
                attributes: {
                    httpOnly: true,
                    secure: isProd,
                    // Needed for the cross-site redirect back from the provider
                    // in production; `lax` is correct over plain http locally.
                    sameSite: isProd ? "none" : "lax",
                    partitioned: isProd,
                },
            },
        },
    },
    // No oAuthProxy() here, deliberately.
    //
    // That plugin exists so a deployment whose URL changes per build (Vercel
    // preview deployments) can register ONE redirect URI with the provider and
    // have callbacks forwarded to the real origin. We don't need it: Google
    // sign-in is used on one known frontend origin.
    //
    // It was also actively breaking Google sign-in. The plugin builds its
    // forwarding URL from the origin of the incoming request — which, because
    // the frontend rewrite forwards to API_BASE (`http://127.0.0.1:5000`),
    // is `127.0.0.1`, not `localhost`. So the browser was sent to
    // 127.0.0.1:5000, the session cookie was set for THAT host, and the final
    // redirect landed on localhost:3000 where a 127.0.0.1 cookie is never
    // sent — cookies are scoped by host and the two are distinct. Sign-in
    // succeeded server-side (account linked, session row written) and the user
    // still bounced to /login.
    //
    // Without the plugin the callback is handled in place: Google returns to
    // `${baseURL}/api/v1/auth/callback/google`, the browser is on the frontend
    // origin throughout, and the cookie is set where it will actually be read.
    plugins: [],
});

// authentication module abstract
