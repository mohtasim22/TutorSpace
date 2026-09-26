"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff } from "lucide-react"
import type { PracticeQuestion } from "./types"

/**
 * Renders a set of questions with the answer hidden behind a toggle.
 *
 * Shared by the tutor (reviewing a draft) and the student (revising), because
 * both want the same thing: read the question, think, then check. The tutor
 * page wraps this with editing controls; the student page does not.
 */
export default function QuestionList({
  questions,
}: {
  questions: PracticeQuestion[]
}) {
  const [revealed, setRevealed] = useState<Record<number, boolean>>({})

  const toggle = (i: number) =>
    setRevealed((prev) => ({ ...prev, [i]: !prev[i] }))

  if (!questions?.length) {
    return (
      <p className="text-sm text-muted-foreground py-4">
        This set has no questions.
      </p>
    )
  }

  return (
    <div className="space-y-5">
      {questions.map((q, i) => (
        <div key={i} className="rounded-lg border p-4 space-y-3">
          <div className="flex items-start justify-between gap-3">
            <p className="text-sm font-medium flex-1">
              {i + 1}. {q.question}
            </p>
            <Badge variant="outline" className="shrink-0">
              {q.type === "mcq" ? "Multiple choice" : "Short answer"}
            </Badge>
          </div>

          {q.type === "mcq" && q.options?.length > 0 && (
            <ul className="space-y-1.5 pl-1">
              {q.options.map((opt, oi) => (
                <li
                  key={oi}
                  className="text-sm text-muted-foreground flex gap-2"
                >
                  <span className="shrink-0">
                    {String.fromCharCode(65 + oi)}.
                  </span>
                  <span>{opt}</span>
                </li>
              ))}
            </ul>
          )}

          <Button
            size="sm"
            variant="ghost"
            onClick={() => toggle(i)}
            className="gap-1 h-7 px-2 text-xs text-muted-foreground hover:text-foreground"
          >
            {revealed[i] ? (
              <>
                <EyeOff className="h-3.5 w-3.5" />
                Hide answer
              </>
            ) : (
              <>
                <Eye className="h-3.5 w-3.5" />
                Show answer
              </>
            )}
          </Button>

          {revealed[i] && (
            <div className="rounded-md bg-muted/50 p-3 space-y-1.5">
              <p className="text-sm">
                <span className="font-medium">Answer: </span>
                {q.answer}
              </p>
              {q.explanation && (
                <p className="text-sm text-muted-foreground">
                  {q.explanation}
                </p>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  )
}
