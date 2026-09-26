import { createHmac } from "crypto";
import { prisma } from "./prisma";

/**
 * Shared entitlement rules for a *live* session — the video call and the
 * collaborative whiteboard.
 *
 * Both features used to decide access separately: the video room did its own
 * booking lookup, and the whiteboard did none at all. That meant three
 * different answers to one question ("may this person be in this session right
 * now?"), and the strictest of them — pay first, then join — existed only in
 * the React component that rendered the button. This module is the single
 * place that answers it, on the server, for both.
 */

/** The session opens this long before `start_time`. */
export const JOIN_OPENS_BEFORE_MS = 15 * 60 * 1000;

/** ...and stays open this long after `end_time`, so an overrun isn't cut off. */
export const JOIN_CLOSES_AFTER_MS = 15 * 60 * 1000;

export type SessionAccess = {
  slot: {
    id: string;
    name: string;
    start_time: Date;
    end_time: Date;
    course_id: string;
    tutor_id: string;
  };
  /**
   * The slot's own tutor, or an admin. Gets moderator rights in the call
   * (can mute and eject) and may save the whiteboard to course materials.
   */
  isOwner: boolean;
  /** Name shown to the other participants. */
  displayName: string;
  /** Unix seconds at which the session stops being joinable. */
  expiresAt: number;
};

/**
 * Resolve whether `userId` may be in `slotId`'s live session right now, and in
 * what capacity. Throws with a message explaining exactly why not — the client
 * shows it verbatim, so "you haven't paid" and "you're 3 hours early" don't
 * both surface as a generic failure.
 *
 * Pass `enforceWindow: false` only for calls that legitimately happen outside
 * the session (there are none today; the flag exists so that a future
 * "prepare the board beforehand" feature does not have to weaken this rule for
 * everyone).
 */
export const resolveSessionAccess = async (
  slotId: string,
  userId: string,
  { enforceWindow = true }: { enforceWindow?: boolean } = {},
): Promise<SessionAccess> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, name: true, role: true, status: true },
  });
  if (!user || user.status !== "ACTIVE") throw new Error("Unauthorized!");

  const slot = await prisma.courseSlot.findUnique({
    where: { id: slotId },
    select: {
      id: true,
      name: true,
      start_time: true,
      end_time: true,
      course_id: true,
      tutor_id: true,
    },
  });
  if (!slot) throw new Error("Session not found");

  let isOwner = false;

  if (user.role === "ADMIN") {
    // Admins observe and moderate any session, and are not time-boxed —
    // they are staff, not participants.
    isOwner = true;
    enforceWindow = false;
  } else if (user.role === "TUTOR") {
    const tutorProfile = await prisma.tutorProfile.findUnique({
      where: { user_id: userId },
      select: { id: true },
    });
    if (!tutorProfile || tutorProfile.id !== slot.tutor_id) {
      throw new Error("Forbidden! This is not your session");
    }
    isOwner = true;
  } else if (user.role === "STUDENT") {
    const booking = await prisma.booking.findFirst({
      where: { course_slot_id: slotId, student_id: userId },
      select: { booking_status: true, payment_status: true },
    });

    // These four branches are deliberately distinct. The old check was
    // `booking_status: { not: "CANCELLED" }`, which let an unpaid, unconfirmed
    // booking into the room — the pay-then-join rule lived only in the UI.
    if (!booking || booking.booking_status === "CANCELLED") {
      throw new Error("Forbidden! You have not booked this session");
    }
    if (booking.booking_status === "PENDING") {
      throw new Error("Your booking is still waiting for the tutor to confirm it");
    }
    if (booking.payment_status !== "PAID") {
      throw new Error("This booking hasn't been paid for yet");
    }
  } else {
    throw new Error("Unauthorized!");
  }

  const start = new Date(slot.start_time).getTime();
  const end = new Date(slot.end_time).getTime();
  const opensAt = start - JOIN_OPENS_BEFORE_MS;
  const closesAt = end + JOIN_CLOSES_AFTER_MS;

  if (enforceWindow) {
    const now = Date.now();
    if (now < opensAt) {
      const minutes = Math.ceil((opensAt - now) / 60000);
      throw new Error(
        minutes > 60
          ? `This session opens ${JOIN_OPENS_BEFORE_MS / 60000} minutes before it starts (${new Date(start).toLocaleString()})`
          : `This session opens in ${minutes} minute${minutes === 1 ? "" : "s"}`,
      );
    }
    if (now > closesAt) {
      throw new Error("This session has already ended");
    }
  }

  return {
    slot,
    isOwner,
    displayName: user.name,
    expiresAt: Math.floor(closesAt / 1000),
  };
};

/**
 * The whiteboard's room id.
 *
 * tldraw's sync server identifies a room by its id alone — there is no
 * authentication on the room itself. Deriving the id from the slot id (the old
 * `tutorspace-wb-<slotId>`) therefore made every board reachable by anyone who
 * could read a slot id out of a URL, including people with no account at all.
 *
 * Hashing it with the server secret keeps the id stable — everyone in the
 * session derives the same room — while making it unguessable from outside.
 * The id is only ever returned to a caller who has passed
 * `resolveSessionAccess`, so possession of it is itself the proof of
 * entitlement.
 */
export const whiteboardRoomId = (slotId: string) => {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) {
    throw new Error("Whiteboard is not configured (missing BETTER_AUTH_SECRET)");
  }
  const digest = createHmac("sha256", secret)
    .update(`whiteboard:${slotId}`)
    .digest("hex");
  return `ts-wb-${digest.slice(0, 32)}`;
};
