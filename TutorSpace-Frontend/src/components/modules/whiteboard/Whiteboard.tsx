"use client"

import dynamic from "next/dynamic"
import { useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import type { Editor } from "tldraw"
import { Button } from "@/components/ui/button"
import { ArrowLeft, PencilRuler, Save } from "lucide-react"
import { uploadToCloudinary } from "@/lib/uploadToCloudinary"
import { saveWhiteboardSnapshot } from "@/services/whiteboard"

// Load the tldraw canvas only in the browser (ssr: false) — tldraw uses
// browser-only APIs and must not render during server-side rendering.
const Board = dynamic(() => import("./Board"), {
  ssr: false,
  loading: () => (
    <div className="h-full flex items-center justify-center text-muted-foreground">
      Loading whiteboard…
    </div>
  ),
})

export default function Whiteboard({
  slotId,
  roomId,
  title,
  canSave,
}: {
  slotId: string
  roomId: string
  title?: string
  canSave?: boolean
}) {
  const router = useRouter()
  const editorRef = useRef<Editor | null>(null)
  const [saving, setSaving] = useState(false)

  /**
   * Export the board as a PNG and file it under the course's materials.
   *
   * This matters because tldraw's sync rooms are not durable storage — the
   * live board is a transport, not an archive. Without this the lesson
   * disappears when the room is recycled, so anything worked through on the
   * board is unrecoverable for the student afterwards.
   */
  const handleSave = async () => {
    const editor = editorRef.current
    if (!editor) return

    const shapeIds = [...editor.getCurrentPageShapeIds()]
    if (shapeIds.length === 0) {
      toast.error("The board is empty — nothing to save")
      return
    }

    try {
      setSaving(true)

      const { blob } = await editor.toImage(shapeIds, {
        format: "png",
        background: true,
        scale: 2,
      })

      const file = new File([blob], `whiteboard-${Date.now()}.png`, {
        type: "image/png",
      })

      const url = await uploadToCloudinary(file)
      const res = await saveWhiteboardSnapshot(slotId, url)

      if (res?.status === "success") {
        toast.success("Saved to course materials")
      } else {
        toast.error(res?.message || "Could not save the whiteboard")
      }
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Could not save the whiteboard"
      )
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-0 sm:px-4 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap px-3 sm:px-0">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        <span className="flex-1 text-center text-base sm:text-lg font-semibold flex items-center justify-center gap-2 truncate">
          <PencilRuler className="h-4 w-4 shrink-0" />
          <span className="truncate">{title || "Collaborative Whiteboard"}</span>
        </span>

        {canSave ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleSave}
            disabled={saving}
            className="gap-1"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving…" : "Save to materials"}
          </Button>
        ) : (
          // Keeps the title optically centred when there is no button.
          <span className="w-16" />
        )}
      </div>

      {/* tldraw fills its nearest positioned ancestor, so this box sets the size */}
      <div className="relative h-[70vh] sm:h-[80vh] overflow-hidden border-y sm:border sm:rounded-xl">
        <Board
          roomId={roomId}
          onMount={(editor) => {
            editorRef.current = editor
          }}
        />
      </div>
    </div>
  )
}
