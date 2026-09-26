// @tutor/dashboard/call/[slotId]/page.tsx

import VideoCall from "@/components/modules/video/VideoCall"

export default async function TutorCallRoute({
  params,
}: {
  params: Promise<{ slotId: string }>
}) {
  const { slotId } = await params
  return <VideoCall slotId={slotId} />
}
