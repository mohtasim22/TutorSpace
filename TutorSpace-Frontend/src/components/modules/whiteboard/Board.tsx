"use client"

import { Tldraw, type Editor } from "tldraw"
import { useSyncDemo } from "@tldraw/sync"
import "tldraw/tldraw.css"

/**
 * The collaborative canvas. Rendered client-only (see Whiteboard.tsx), because
 * tldraw depends on browser APIs and can't render on the server.
 *
 * `roomId` is issued by the API after an entitlement check — it is a keyed hash
 * of the slot id, not the slot id itself, because tldraw's sync service
 * authenticates nobody: whoever knows the room id is in the room. Deriving it
 * on the client would hand that id to anyone who could read a slot id.
 *
 * `onMount` hands the editor up to the parent so the tutor can export the board.
 */
export default function Board({
  roomId,
  onMount,
}: {
  roomId: string
  onMount?: (editor: Editor) => void
}) {
  const store = useSyncDemo({ roomId })
  return <Tldraw store={store} onMount={onMount} />
}
