// @student/dashboard/whiteboard/[slotId]/page.tsx

import Whiteboard from "@/components/modules/whiteboard/Whiteboard"
import SessionAccessDenied from "@/components/shared/SessionAccessDenied"
import { getWhiteboardAccess } from "@/services/whiteboard"

/**
 * The board is only rendered once the API has confirmed this student has a
 * confirmed, paid booking on the slot and the session window is open. The page
 * previously rendered a board straight from the slot id in the URL, so any
 * signed-in user could open anyone else's session by editing the address bar.
 */
export default async function StudentWhiteboardRoute({
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
