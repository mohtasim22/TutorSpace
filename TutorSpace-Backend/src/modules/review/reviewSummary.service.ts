// Zod 4 (shipped inside zod 3.25 at this subpath) — the SDK's zodOutputFormat
// helper is typed against v4. The rest of the codebase stays on the v3 entry
// point, which is what `validateRequest` and every *.validation.ts file use.
import { z } from "zod/v4";
import { prisma } from "../../lib/prisma";
import { anthropic, MODEL } from "../../lib/anthropic";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";

/**
 * AI summaries of a tutor's reviews.
 *
 * Design notes that matter more than the code:
 *
 * - Summaries are CACHED on the tutor profile and refreshed by the cron pass,
 *   never generated while rendering a page. A public profile should not wait
 *   on a model call, and a failed call should not fail the page.
 *
 * - A summary is only produced from MIN_REVIEWS or more reviews. Summarising
 *   one or two reviews isn't summarising, it's paraphrasing an individual —
 *   and it would let a single opinion read as a general consensus.
 *
 * - The summary reports criticism as well as praise. A summary that quietly
 *   drops negative feedback misleads the student deciding whether to book,
 *   which is precisely the person it is shown to.
 */

/** Below this, there isn't enough material for a summary to mean anything. */
export const MIN_REVIEWS = 3;

/** Don't regenerate more often than this, even as reviews arrive. */
const MIN_REFRESH_INTERVAL_MS = 24 * 60 * 60 * 1000;

const SummarySchema = z.object({
  summary: z
    .string()
    .describe(
      "Two or three sentences describing what students report about this tutor, in neutral third person.",
    ),
  themes: z
    .array(z.string())
    .describe(
      "Short phrases (2-4 words) for points raised in more than one review.",
    ),
});

const SYSTEM = `You summarise student reviews of a tutor for other students who are deciding whether to book them.

Rules:
- Every statement must be supported by the reviews given. Never add detail that is not there.
- Only report a theme if it appears in more than one review. A single opinion is not a pattern.
- Include criticism where the reviews contain it. A summary that reports only praise misleads the reader.
- Write in neutral third person about the tutor. Do not address the reader and do not recommend or discourage booking.
- Do not name individual students.
- If the reviews are too thin or contradictory to summarise fairly, say so plainly in the summary field.`;

/**
 * Generate and store a summary for one tutor. Returns null when the tutor has
 * too few reviews to summarise.
 */
export const generateSummaryForTutor = async (tutorId: string) => {
  const tutor = await prisma.tutorProfile.findUnique({
    where: { id: tutorId },
    select: { id: true, display_name: true },
  });
  if (!tutor) throw new Error("Tutor not found");

  const reviews = await prisma.review.findMany({
    where: { tutor_id: tutorId, status: "APPROVED" },
    select: { rating: true, comment: true, createdAt: true },
    orderBy: { createdAt: "desc" },
    // A cap keeps the prompt bounded as a tutor accumulates reviews. The most
    // recent are the most relevant to someone booking now.
    take: 100,
  });

  const usable = reviews.filter((r) => r.comment && r.comment.trim().length > 0);
  if (usable.length < MIN_REVIEWS) return null;

  const rendered = usable
    .map((r, i) => `Review ${i + 1} (${r.rating}/5 stars): ${r.comment!.trim()}`)
    .join("\n\n");

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 2000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: `Summarise these ${usable.length} reviews of ${tutor.display_name}.\n\n${rendered}`,
      },
    ],
    output_config: { format: zodOutputFormat(SummarySchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed) throw new Error("Could not summarise the reviews");

  const text = parsed.themes.length
    ? `${parsed.summary}\n\nRecurring themes: ${parsed.themes.join(", ")}.`
    : parsed.summary;

  await prisma.tutorProfile.update({
    where: { id: tutorId },
    data: {
      review_summary: text,
      // Counted against ALL approved reviews, not just the ones with comments,
      // so the staleness check below lines up with `total_reviews`.
      review_summary_count: reviews.length,
      review_summary_at: new Date(),
    },
  });

  return { summary: text, reviewCount: reviews.length };
};

/**
 * Refresh every tutor whose summary has fallen behind. Called by the cron
 * endpoint, so it runs off the request path and one tutor's failure does not
 * abort the rest.
 */
export const refreshStaleSummaries = async (limit = 10) => {
  const cutoff = new Date(Date.now() - MIN_REFRESH_INTERVAL_MS);

  const candidates = await prisma.tutorProfile.findMany({
    where: {
      total_reviews: { gte: MIN_REVIEWS },
      OR: [
        { review_summary: null },
        { review_summary_at: { lt: cutoff } },
      ],
    },
    select: { id: true, total_reviews: true, review_summary_count: true },
    take: limit,
  });

  // Nothing new has been said since the last summary, so there is nothing to
  // re-summarise — skip the call rather than pay for an identical answer.
  const stale = candidates.filter(
    (t) => t.review_summary_count !== t.total_reviews,
  );

  let updated = 0;
  let failed = 0;

  for (const tutor of stale) {
    try {
      const result = await generateSummaryForTutor(tutor.id);
      if (result) updated++;
    } catch (error) {
      failed++;
      console.error(`Review summary failed for tutor ${tutor.id}:`, error);
    }
  }

  return { considered: stale.length, updated, failed };
};
