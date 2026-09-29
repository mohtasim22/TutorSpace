// Zod 4 subpath — see practice.service.ts for why.
import { z } from "zod/v4";
import { prisma } from "../../lib/prisma";
import { anthropic, aiConfigured, MODEL } from "../../lib/anthropic";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import { pdfSourceBlock, resolveMaterialAccess } from "../../lib/materialAccess";

/**
 * AI summary of a course material (PDF).
 *
 * The summary is generated once and stored on the material. Every student in
 * the course then reads the same summary: the model is called once per
 * material instead of once per student, and two students comparing notes are
 * not looking at two different machine-written versions of the same lecture.
 *
 * Only the course's tutor can regenerate it, for example after replacing a
 * weak summary, and not more often than REGENERATE_COOLDOWN_MS.
 */

const REGENERATE_COOLDOWN_MS = 5 * 60 * 1000;

const SummarySchema = z.object({
  overview: z
    .string()
    .describe("Three to five sentences on what the material covers and why it matters."),
  key_points: z
    .array(z.string())
    .describe("The main points a student should take away, one sentence each."),
  key_terms: z
    .array(z.object({ term: z.string(), meaning: z.string() }))
    .describe("Important terms defined in the material, with a one-line meaning each."),
});

export type MaterialSummary = z.infer<typeof SummarySchema>;

const SYSTEM = `You summarise a tutor's course material for the students taking that course.

Rules:
- Use only what is in the supplied material. Do not add facts, examples or claims from outside it.
- Write for a student revising: plain language, no filler, no praise of the material.
- key_points: between 4 and 8, in the order the material presents them.
- key_terms: only terms the material itself introduces or defines, at most 10. Return an empty list if there are none.
- If part of the material is unreadable (for example a scanned page), summarise what is readable and do not guess at the rest.`;

/**
 * Return the material's summary, generating it on first request.
 *
 * `regenerate` is honoured only for the course's tutor.
 */
const getOrCreateSummary = async (
  materialId: string,
  userId: string,
  { regenerate = false }: { regenerate?: boolean } = {},
) => {
  const { material, isOwner } = await resolveMaterialAccess(materialId, userId);

  if (regenerate && !isOwner) {
    throw new Error("Only the course's tutor can regenerate a summary");
  }

  if (material.summary && !regenerate) {
    return { summary: material.summary as MaterialSummary, summary_at: material.summary_at, cached: true };
  }

  if (
    regenerate &&
    material.summary_at &&
    Date.now() - material.summary_at.getTime() < REGENERATE_COOLDOWN_MS
  ) {
    throw new Error("This summary was just generated. Try again in a few minutes.");
  }

  if (!aiConfigured()) {
    throw new Error("AI features are not configured (missing ANTHROPIC_API_KEY)");
  }

  const sourceBlock = await pdfSourceBlock(material.file_url, material.title);

  const response = await anthropic().messages.parse({
    model: MODEL,
    max_tokens: 4000,
    system: SYSTEM,
    messages: [
      {
        role: "user",
        content: [
          sourceBlock,
          {
            type: "text",
            text: `Summarise this material ("${material.title}", from the course "${material.course.name}").`,
          },
        ],
      },
    ],
    output_config: { format: zodOutputFormat(SummarySchema) },
  });

  const parsed = response.parsed_output;
  if (!parsed || !parsed.overview) {
    throw new Error("Could not summarise this material");
  }

  const updated = await prisma.courseMaterial.update({
    where: { id: material.id },
    data: { summary: parsed, summary_at: new Date() },
    select: { summary: true, summary_at: true },
  });

  return { summary: updated.summary as MaterialSummary, summary_at: updated.summary_at, cached: false };
};

export const MaterialSummaryService = { getOrCreateSummary };
