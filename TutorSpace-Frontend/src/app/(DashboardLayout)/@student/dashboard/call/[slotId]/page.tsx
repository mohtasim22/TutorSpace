// @student/dashboard/call/[slotId]/page.tsx

import VideoCall from "@/components/modules/video/VideoCall"

export default async function StudentCallRoute({
  params,
}: {
  params: Promise<{ slotId: string }>
}) {
  const { slotId } = await params
  return <VideoCall slotId={slotId} />
}
