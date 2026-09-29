"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { CheckCircle2, XCircle, RotateCcw } from "lucide-react"
import { cn } from "@/lib/utils"
import type { PracticeQuestion } from "./types"

/**
 * An interactive quiz for the student.
 *
 * Multiple-choice questions are marked automatically; a short answer is shown
 * next to the expected answer so the student can compare. Nothing is saved or
 * graded: this is revision, not assessment. Every question shows its
 * explanation after submitting, which points back to the material, so an
 * answer can be checked against the source rather than simply trusted.
 */

/** Index of the correct option: exact text match first, then a letter like "B". */
const correctIndex = (q: PracticeQuestion) => {
  const norm = (s: string) => s.trim().toLowerCase()
  const byText = q.options.findIndex((o) => norm(o) === norm(q.answer))
  if (byText >= 0) return byText
  const letter = /^([a-d])[).:]?\s*$/i.exec(q.answer.trim())
  return letter ? letter[1].toLowerCase().charCodeAt(0) - 97 : -1
}

export default function QuizPlayer({ questions }: { questions: PracticeQuestion[] }) {
  const [picked, setPicked] = useState<Record<number, number>>({})
  const [typed, setTyped] = useState<Record<number, string>>({})
  const [submitted, setSubmitted] = useState(false)

  if (!questions?.length) {
    return <p className="text-sm text-muted-foreground py-4">This quiz has no questions.</p>
  }

  const mcqs = questions
    .map((q, i) => ({ q, i }))
    .filter(({ q }) => q.type === "mcq" && q.options?.length > 0)
  const score = mcqs.filter(({ q, i }) => picked[i] === correctIndex(q)).length

  const reset = () => {
    setPicked({})
    setTyped({})
    setSubmitted(false)
  }

  return (
    <div className="space-y-5">
      {questions.map((q, i) => {
        const isMcq = q.type === "mcq" && q.options?.length > 0
        const right = isMcq ? correctIndex(q) : -1
        return (
          <div key={i} className="rounded-lg border p-4 space-y-3">
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium flex-1">
                {i + 1}. {q.question}
              </p>
              <Badge variant="outline" className="shrink-0">
                {isMcq ? "Multiple choice" : "Short answer"}
              </Badge>
            </div>

            {isMcq ? (
              <div className="grid gap-2">
                {q.options.map((opt, oi) => {
                  const chosen = picked[i] === oi
                  const showRight = submitted && oi === right
                  const showWrong = submitted && chosen && oi !== right
                  return (
                    <button
                      key={oi}
                      type="button"
                      disabled={submitted}
                      onClick={() => setPicked((p) => ({ ...p, [i]: oi }))}
                      className={cn(
                        "text-left text-sm rounded-md border px-3 py-2 flex gap-2 items-start transition-colors",
                        !submitted && "hover:bg-muted",
                        chosen && !submitted && "border-primary bg-primary/5",
                        showRight && "border-green-600 bg-green-600/10",
                        showWrong && "border-destructive bg-destructive/10",
                      )}
                    >
                      <span className="shrink-0 font-medium">{String.fromCharCode(65 + oi)}.</span>
                      <span className="flex-1">{opt}</span>
                      {showRight && <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />}
                      {showWrong && <XCircle className="h-4 w-4 text-destructive shrink-0" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <Input
                value={typed[i] ?? ""}
                disabled={submitted}
                onChange={(e) => setTyped((t) => ({ ...t, [i]: e.target.value }))}
                placeholder="Type your answer"
              />
            )}

            {submitted && (
              <div className="rounded-md bg-muted/50 p-3 space-y-1.5">
                <p className="text-sm">
                  <span className="font-medium">Answer: </span>
                  {q.answer}
                </p>
                {q.explanation && (
                  <p className="text-sm text-muted-foreground">{q.explanation}</p>
                )}
              </div>
            )}
          </div>
        )
      })}

      <div className="flex flex-wrap items-center gap-3">
        {submitted ? (
          <>
            {mcqs.length > 0 && (
              <p className="text-sm font-medium">
                Score: {score} / {mcqs.length} multiple-choice correct
              </p>
            )}
            <Button variant="outline" size="sm" className="gap-1" onClick={reset}>
              <RotateCcw className="h-4 w-4" />
              Try again
            </Button>
          </>
        ) : (
          <Button size="sm" onClick={() => setSubmitted(true)}>
            Check my answers
          </Button>
        )}
      </div>
    </div>
  )
}
