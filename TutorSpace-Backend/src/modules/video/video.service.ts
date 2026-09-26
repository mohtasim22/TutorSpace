import { resolveSessionAccess, SessionAccess } from "../../lib/sessionAccess";

const DAILY_API = "https://api.daily.co/v1";

const dailyKey = () => {
  const apiKey = process.env.DAILY_API_KEY;
  if (!apiKey) throw new Error("Video is not configured (missing DAILY_API_KEY)");
  return apiKey;
};

const dailyHeaders = () => ({
  Authorization: `Bearer ${dailyKey()}`,
  "Content-Type": "application/json",
});

/**
 * Room configuration. `exp` is a hard stop enforced by Daily itself: combined
 * with `eject_at_room_exp`, the call ends for everyone when the session's
 * window closes, whether or not our own checks are consulted again.
 */
const roomProperties = (access: SessionAccess) => ({
  exp: access.expiresAt,
  eject_at_room_exp: true,
  enable_screenshare: true,
  enable_chat: true,
  // Lets a participant check their camera and mic before walking into a
  // lesson, and gives the browser a user gesture to attach permissions to.
  enable_prejoin_ui: true,
});

/**
 * Create the room, or bring an existing one up to date.
 *
 * Rooms were previously created with `privacy: "public"` and cached on the
 * slot forever, which made the URL a permanent bearer token — anyone it was
 * forwarded to could walk in. They are now private, so the URL alone is inert
 * and a meeting token is required to join.
 *
 * The update call on the "already exists" path is what migrates rooms created
 * under the old public setting: the first time anyone joins such a session, it
 * is flipped to private and given an expiry. Nothing has to be cleaned up by
 * hand.
 */
const ensureRoom = async (roomName: string, access: SessionAccess) => {
  const createRes = await fetch(`${DAILY_API}/rooms`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({
      name: roomName,
      privacy: "private",
      properties: roomProperties(access),
    }),
  });

  if (createRes.ok) {
    const data: any = await createRes.json();
    return data.url as string;
  }

  // Daily answers 400 when the name is taken. Update it rather than reusing it
  // blind — we cannot assume an existing room has the settings we want.
  const updateRes = await fetch(`${DAILY_API}/rooms/${roomName}`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({
      privacy: "private",
      properties: roomProperties(access),
    }),
  });

  if (updateRes.ok) {
    const data: any = await updateRes.json();
    return data.url as string;
  }

  const err: any = await createRes.json().catch(() => ({}));
  throw new Error(err?.info || "Failed to prepare the video room");
};

/**
 * A single-use-ish credential for one participant in one room. `is_owner`
 * gives the tutor moderator controls (mute and eject); students get none.
 * `exp` bounds the token to the session window, so a copied join URL stops
 * working once the lesson is over.
 */
const mintMeetingToken = async (roomName: string, access: SessionAccess) => {
  const res = await fetch(`${DAILY_API}/meeting-tokens`, {
    method: "POST",
    headers: dailyHeaders(),
    body: JSON.stringify({
      properties: {
        room_name: roomName,
        user_name: access.displayName,
        is_owner: access.isOwner,
        exp: access.expiresAt,
        eject_at_token_exp: true,
      },
    }),
  });

  if (!res.ok) {
    const err: any = await res.json().catch(() => ({}));
    throw new Error(err?.info || "Failed to authorise you for the video room");
  }

  const data: any = await res.json();
  if (!data?.token) throw new Error("Failed to authorise you for the video room");
  return data.token as string;
};

/**
 * Returns a join URL for the slot's video room, valid only for this caller and
 * only for this session's time window.
 *
 * Note that the URL is no longer cached on `slot.meeting_link`. That column is
 * a field the tutor fills in on the slot form (an external link they want to
 * share); overwriting it with a generated Daily URL clobbered the tutor's own
 * value, and a cached URL cannot carry a per-user token anyway.
 */
const getOrCreateRoom = async (slotId: string, userId: string) => {
  const access = await resolveSessionAccess(slotId, userId);

  const roomName = `tutorspace-${slotId}`;
  const url = await ensureRoom(roomName, access);
  const token = await mintMeetingToken(roomName, access);

  return {
    url: `${url}?t=${token}`,
    title: access.slot.name,
    isOwner: access.isOwner,
  };
};

export const VideoService = { getOrCreateRoom };
