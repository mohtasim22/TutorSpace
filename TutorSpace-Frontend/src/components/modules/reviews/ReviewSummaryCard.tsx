import { Card, CardContent } from "@/components/ui/card"
import { Sparkles } from "lucide-react"

/**
 * The AI-written summary of a tutor's reviews.
 *
 * The "AI summary" label is deliberate and not decorative. These sentences
 * summarise what real students wrote; shown unlabelled they read as editorial
 * copy written by a person. The reader is someone deciding whether to spend
 * money on this tutor, so they are told what they are reading and how many
 * reviews it came from.
 *
 * Renders nothing when there is no cached summary — the summary is generated
 * on a schedule, so a new tutor simply has the review list below and no card.
 */
export default function ReviewSummaryCard({
  summary,
  reviewCount,
}: {
  summary?: string | null
  reviewCount?: number | null
}) {
  if (!summary) return null

  return (
    <Card className="border-indigo-500/20 bg-indigo-500/5">
      <CardContent className="py-5 space-y-3">
        <div className="flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-indigo-400 shrink-0" />
          <span className="text-sm font-semibold">What students say</span>
          <span className="text-xs text-muted-foreground ml-auto">
            AI summary of {reviewCount ?? 0} review
            {reviewCount === 1 ? "" : "s"}
          </span>
        </div>

        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {summary}
        </p>
      </CardContent>
    </Card>
  )
}
