"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Video, Maximize, PencilRuler } from "lucide-react"
import { Button } from "@/components/ui/button"
import { getRoom } from "@/services/video"
import SessionAccessDenied from "@/components/shared/SessionAccessDenied"

export default function VideoCall({ slotId }: { slotId: string }) {
  const router = useRouter()
  const containerRef = useRef<HTMLDivElement>(null)

  const [url, setUrl] = useState<string | null>(null)
  const [title, setTitle] = useState<string>("")
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    getRoom(slotId)
      .then((res) => {
        if (!active) return
        if (res?.status === "success" && res.url) {
          setUrl(res.url)
          setTitle(res.title || "Live Session")
        } else {
          setError(res?.message || "Could not start the video call")
        }
        setLoading(false)
      })
      .catch(() => {
        if (!active) return
        setError("Something went wrong")
        setLoading(false)
      })
    return () => {
      active = false
    }
  }, [slotId])

  // Expand the video container itself to fill the screen.
  const goFullscreen = () => {
    containerRef.current?.requestFullscreen?.()
  }

  return (
    <div className="max-w-7xl mx-auto py-4 sm:py-6 px-0 sm:px-4 space-y-3 sm:space-y-4">
      <div className="flex items-center justify-between gap-2 flex-wrap px-3 sm:px-0">
        {/* Back returns to wherever the user came from (bookings or calendar). */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="gap-1 text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back
        </Button>

        {/* Session title */}
        <h1 className="flex-1 text-center text-base sm:text-lg font-semibold flex items-center justify-center gap-2 truncate">
          <Video className="h-4 w-4 shrink-0" />
          <span className="truncate">{title || "Live Session"}</span>
        </h1>

        <div className="flex items-center gap-2">
          {/* Open the shared whiteboard in a new tab so it can sit beside the call */}
          <Button
            variant="outline"
            size="sm"
            onClick={() =>
              window.open(`/dashboard/whiteboard/${slotId}`, "_blank")
            }
            className="gap-1"
          >
            <PencilRuler className="h-4 w-4" />
            Whiteboard
          </Button>
          {url && (
            <Button variant="outline" size="sm" onClick={goFullscreen} className="gap-1">
              <Maximize className="h-4 w-4" />
              Fullscreen
            </Button>
          )}
        </div>
      </div>

      {loading ? (
        <div className="h-[80vh] flex items-center justify-center rounded-xl border text-muted-foreground">
          Starting video…
        </div>
      ) : error ? (
        // The API's message says *why* — too early, unpaid, not yours — and each
        // of those is a different next step for the user.
        <SessionAccessDenied message={error} />
      ) : (
        <div
          ref={containerRef}
          className="overflow-hidden border-y sm:border sm:rounded-xl bg-black"
        >
          <iframe
            src={url!}
            title={title}
            allow="camera; microphone; fullscreen; display-capture; autoplay"
            allowFullScreen
            className="w-full h-[70vh] sm:h-[80vh]"
          />
        </div>
      )}
    </div>
  )
}
