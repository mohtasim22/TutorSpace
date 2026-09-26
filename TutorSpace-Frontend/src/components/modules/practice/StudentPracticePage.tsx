"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Sparkles, ChevronDown, ChevronUp } from "lucide-react"
import QuestionList from "./QuestionList"
import type { PracticeSet } from "./types"

/**
 * The student's view — published sets for courses they have booked.
 *
 * Read-and-reveal rather than a scored quiz: there is no attempt record, no
 * marking and no grade. These are revision prompts the tutor approved, not
 * assessment, and nothing here feeds into the student's results.
 */
export default function StudentPracticePage({ sets }: { sets: PracticeSet[] }) {
  const [openId, setOpenId] = useState<string | null>(sets[0]?.id ?? null)

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Sparkles className="h-6 w-6" />
          Practice Questions
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Revision questions from your tutors&apos; course materials. Nothing
          here is graded — check your answer when you are ready.
        </p>
      </div>

      {sets.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No practice questions yet. They appear here once a tutor publishes
            a set for a course you have booked.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {sets.map((set) => {
            const isOpen = openId === set.id
            return (
              <Card key={set.id}>
                <CardContent className="py-4 space-y-4">
                  <div className="flex items-center gap-3 flex-wrap">
                    <div className="min-w-0 flex-1">
                      <div className="font-medium truncate">{set.title}</div>
                      <div className="flex items-center gap-2 mt-1 flex-wrap">
                        <Badge variant="outline">
                          {set.course?.name ?? "Course"}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {set.questions?.length ?? 0} questions
                        </span>
                      </div>
                    </div>

                    <Button
                      size="sm"
                      variant="outline"
                      className="gap-1"
                      onClick={() => setOpenId(isOpen ? null : set.id)}
                    >
                      {isOpen ? (
                        <>
                          <ChevronUp className="h-4 w-4" />
                          Close
                        </>
                      ) : (
                        <>
                          <ChevronDown className="h-4 w-4" />
                          Practise
                        </>
                      )}
                    </Button>
                  </div>

                  {isOpen && (
                    <div className="pt-3 border-t">
                      <QuestionList questions={set.questions ?? []} />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
