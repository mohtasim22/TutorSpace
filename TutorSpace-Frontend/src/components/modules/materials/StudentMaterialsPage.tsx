"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, Download, FileText, Sparkles, ChevronUp } from "lucide-react"
import { summariseMaterial } from "@/services/materials"
import { generatePracticeSet } from "@/services/practice"
import SummaryPanel from "./SummaryPanel"
import { isPdf, type Material, type MaterialSummary } from "@/components/modules/practice/types"

/**
 * The student's course materials, with the two AI study tools on each PDF:
 *
 * - Summarise: shows the material's summary, generating it the first time
 *   anyone in the course asks. After that every student reads the same one.
 * - Practice quiz: generates a quiz from the PDF for this student alone and
 *   opens the Practice page, where it can be taken.
 */
export default function StudentMaterialsPage({ materials }: { materials: Material[] }) {
  const router = useRouter()
  const [summaries, setSummaries] = useState<Record<string, MaterialSummary>>(() =>
    Object.fromEntries(materials.filter((m) => m.summary).map((m) => [m.id, m.summary!])),
  )
  const [openId, setOpenId] = useState<string | null>(null)
  const [busy, setBusy] = useState<{ id: string; what: "summary" | "quiz" } | null>(null)

  const grouped = materials.reduce<Record<string, Material[]>>((acc, m) => {
    const key = m.course?.name ?? "Course"
    ;(acc[key] ??= []).push(m)
    return acc
  }, {})
  const courseNames = Object.keys(grouped)

  const handleSummary = async (id: string) => {
    if (openId === id) return setOpenId(null)
    if (summaries[id]) return setOpenId(id)
    try {
      setBusy({ id, what: "summary" })
      const res = await summariseMaterial(id)
      if (res?.status === "success" && res.summary) {
        setSummaries((s) => ({ ...s, [id]: res.summary }))
        setOpenId(id)
      } else {
        toast.error(res?.message || "Could not summarise this material")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBusy(null)
    }
  }

  const handleQuiz = async (id: string) => {
    try {
      setBusy({ id, what: "quiz" })
      const res = await generatePracticeSet(id)
      if (res?.status === "success") {
        toast.success("Your quiz is ready")
        router.push("/dashboard/practice")
      } else {
        toast.error(res?.message || "Could not generate a quiz")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setBusy(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="h-6 w-6" />
          Course Materials
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          For any PDF, you can read an AI summary or generate a practice quiz
          from it. Both are based only on that PDF.
        </p>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No materials yet. Once your tutor uploads resources for a course
            you&apos;ve booked, they&apos;ll show up here.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {courseNames.map((course) => (
            <div key={course} className="space-y-2">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold">{course}</h2>
                <Badge variant="secondary" className="text-[10px]">
                  {grouped[course].length}
                </Badge>
              </div>
              {grouped[course].map((m) => {
                const pdf = isPdf(m.file_url)
                const isBusy = busy?.id === m.id
                return (
                  <div key={m.id} className="rounded-lg border p-4 space-y-3">
                    <div className="flex flex-wrap items-center gap-2 sm:gap-4">
                      <span className="min-w-0 flex-1 basis-full sm:basis-auto font-medium truncate">
                        {m.title}
                      </span>
                      {pdf && (
                        <>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            disabled={isBusy}
                            onClick={() => handleSummary(m.id)}
                          >
                            {openId === m.id ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <FileText className="h-4 w-4" />
                            )}
                            {isBusy && busy?.what === "summary"
                              ? "Summarising..."
                              : openId === m.id
                                ? "Hide summary"
                                : "Summary"}
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            className="gap-1"
                            disabled={isBusy}
                            onClick={() => handleQuiz(m.id)}
                          >
                            <Sparkles className="h-4 w-4" />
                            {isBusy && busy?.what === "quiz" ? "Generating..." : "Practice quiz"}
                          </Button>
                        </>
                      )}
                      <Button asChild size="sm" variant="outline" className="gap-1">
                        <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                          <Download className="h-4 w-4" />
                          Download
                        </a>
                      </Button>
                    </div>
                    {openId === m.id && summaries[m.id] && (
                      <SummaryPanel summary={summaries[m.id]} />
                    )}
                  </div>
                )
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
