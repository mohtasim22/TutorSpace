/**
 * Shared Prisma `select` shapes for the User model.
 *
 * Why this exists
 * ---------------
 * `include: { user: true }` (or `student: true`) returns EVERY scalar column of
 * the row — including `password`, which holds the bcrypt hash. Several queries
 * did exactly that, so password hashes were being serialised into API
 * responses: to tutors in their booking lists, to admins in the user list, and
 * — worst — to anonymous visitors from the public `GET /api/v1/tutors` route.
 *
 * Prisma has no "exclude this column" option, so the only safe pattern is to
 * name the columns explicitly. Use these constants instead of `true` wherever a
 * User is attached to a response.
 */

/** Safe to expose publicly — no email, no status, no credential material. */
export const publicUserSelect = {
  id: true,
  name: true,
  image: true,
} as const;

/**
 * For authenticated contexts where the caller legitimately needs to contact or
 * identify the person (a tutor seeing who booked their session, an admin
 * reviewing accounts). Still never includes `password`.
 */
export const privateUserSelect = {
  id: true,
  name: true,
  email: true,
  image: true,
  role: true,
  status: true,
  createdAt: true,
} as const;

/** Internal use only — server-side email composition, never returned to a client. */
export const contactUserSelect = {
  id: true,
  name: true,
  email: true,
} as const;
