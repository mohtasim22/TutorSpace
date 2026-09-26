import { prisma } from "../../lib/prisma";
import { pick } from "../../lib/pick";
import { resolveSessionAccess, whiteboardRoomId } from "../../lib/sessionAccess";

/**
 * Grant access to a session's shared whiteboard.
 *
 * The board itself is synchronised by tldraw's hosted sync service, which has
 * no notion of our users — a client that knows a room id is in that room. So
 * this endpoint is the whole access control story: it runs the same
 * entitlement check as the video call, and only then hands back the room id,
 * which is a keyed hash and cannot be derived from anything the client already
 * knows. Previously the page simply rendered a board keyed on the slot id from
 * the URL, with no check at all.
 */
const getAccess = async (slotId: string, userId: string) => {
  const access = await resolveSessionAccess(slotId, userId);

  return {
    roomId: whiteboardRoomId(slotId),
    title: access.slot.name,
    isOwner: access.isOwner,
    courseId: access.slot.course_id,
  };
};

/**
 * Save an exported image of the board into the slot's course materials, so the
 * lesson survives the session. tldraw's sync rooms are not permanent storage;
 * this is what makes the board something the student can open again next week.
 *
 * Tutor-only: `isOwner` is true for the slot's own tutor and for admins.
 */
const saveSnapshot = async (
  slotId: string,
  userId: string,
  payload: unknown,
) => {
  const access = await resolveSessionAccess(slotId, userId);
  if (!access.isOwner) {
    throw new Error("Forbidden! Only the tutor can save the whiteboard");
  }

  const { file_url, title } = pick<{ file_url?: string; title?: string }>(
    payload,
    ["file_url", "title"],
  );
  if (!file_url) throw new Error("A file is required");

  // The material is filed against the tutor who owns the *course*, not the
  // caller — otherwise an admin saving a board would write their own id into a
  // column that must reference a tutor profile.
  const course = await prisma.course.findUnique({
    where: { id: access.slot.course_id },
    select: { id: true, tutor_id: true },
  });
  if (!course) throw new Error("Course not found");

  return prisma.courseMaterial.create({
    data: {
      title: title?.trim() || `Whiteboard — ${access.slot.name}`,
      file_url,
      course_id: course.id,
      tutor_id: course.tutor_id,
    },
    include: { course: true },
  });
};

export const WhiteboardService = { getAccess, saveSnapshot };
