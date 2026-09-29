import { Badge } from "@/components/ui/badge"
import type { MaterialSummary } from "@/components/modules/practice/types"

/**
 * Renders a material's AI summary.
 *
 * Labelled as AI-generated on purpose: the student should know these sentences
 * were written by a model from the PDF, not by their tutor, and that the PDF
 * itself remains the source to trust.
 */
export default function SummaryPanel({ summary }: { summary: MaterialSummary }) {
  return (
    <div className="rounded-md border bg-muted/30 p-4 space-y-3 text-sm">
      <Badge variant="secondary" className="text-[10px]">
        AI summary of this PDF. Check the material for anything important.
      </Badge>

      <p className="leading-relaxed">{summary.overview}</p>

      {summary.key_points?.length > 0 && (
        <div>
          <p className="font-medium mb-1">Key points</p>
          <ul className="list-disc pl-5 space-y-1">
            {summary.key_points.map((p, i) => (
              <li key={i}>{p}</li>
            ))}
          </ul>
        </div>
      )}

      {summary.key_terms?.length > 0 && (
        <div>
          <p className="font-medium mb-1">Key terms</p>
          <dl className="space-y-1">
            {summary.key_terms.map((t, i) => (
              <div key={i}>
                <dt className="inline font-medium">{t.term}: </dt>
                <dd className="inline text-muted-foreground">{t.meaning}</dd>
              </div>
            ))}
          </dl>
        </div>
      )}
    </div>
  )
}
