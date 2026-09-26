// @tutor/dashboard/whiteboard/[slotId]/page.tsx

import Whiteboard from "@/components/modules/whiteboard/Whiteboard"
import SessionAccessDenied from "@/components/shared/SessionAccessDenied"
import { getWhiteboardAccess } from "@/services/whiteboard"

/**
 * Same guard as the student route — the API confirms this tutor owns the slot
 * and that the session window is open before issuing the room id.
 */
export default async function TutorWhiteboardRoute({
  params,
}: {
  params: Promise<{ slotId: string }>
}) {
  const { slotId } = await params
  const access = await getWhiteboardAccess(slotId)

  if (access?.status !== "success" || !access?.roomId) {
    return <SessionAccessDenied message={access?.message} />
  }

  return (
    <Whiteboard
      slotId={slotId}
      roomId={access.roomId}
      title={access.title}
      canSave={access.isOwner}
    />
  )
}
