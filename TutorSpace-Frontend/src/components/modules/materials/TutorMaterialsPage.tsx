"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { FolderOpen, Plus, Download, Trash2, Sparkles, FileText, ChevronUp, RefreshCw } from "lucide-react"
import { createMaterial, deleteMaterial, summariseMaterial } from "@/services/materials"
import { generatePracticeSet } from "@/services/practice"
import { uploadToCloudinary } from "@/lib/uploadToCloudinary"
import SummaryPanel from "./SummaryPanel"
import { isPdf, type Material, type MaterialSummary } from "@/components/modules/practice/types"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

type Course = { id: string; name: string }

interface Props {
  materials: Material[]
  courses: Course[]
}

export default function TutorMaterialsPage({ materials, courses }: Props) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [courseId, setCourseId] = useState("")
  const [file, setFile] = useState<File | null>(null)
  const [busy, setBusy] = useState(false)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [generatingId, setGeneratingId] = useState<string | null>(null)
  const [summaries, setSummaries] = useState<Record<string, MaterialSummary>>(() =>
    Object.fromEntries(materials.filter((m) => m.summary).map((m) => [m.id, m.summary!])),
  )
  const [summaryOpenId, setSummaryOpenId] = useState<string | null>(null)
  const [summarisingId, setSummarisingId] = useState<string | null>(null)

  /**
   * Show this material's summary, generating it if nobody has asked yet.
   * With `regenerate`, replace the stored summary — tutor only, which the API
   * enforces as well.
   */
  const handleSummary = async (id: string, regenerate = false) => {
    if (!regenerate && summaryOpenId === id) return setSummaryOpenId(null)
    if (!regenerate && summaries[id]) return setSummaryOpenId(id)
    try {
      setSummarisingId(id)
      const res = await summariseMaterial(id, regenerate)
      if (res?.status === "success" && res.summary) {
        setSummaries((s) => ({ ...s, [id]: res.summary }))
        setSummaryOpenId(id)
        if (regenerate) toast.success("Summary regenerated")
      } else {
        toast.error(res?.message || "Could not summarise this material")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setSummarisingId(null)
    }
  }

  const resetForm = () => {
    setTitle("")
    setCourseId("")
    setFile(null)
  }

  const handleUpload = async () => {
    if (!title.trim()) return toast.error("Please add a title")
    if (!courseId) return toast.error("Please pick a course")
    if (!file) return toast.error("Please choose a file")
    try {
      setBusy(true)
      // Upload the file to Cloudinary, then store its URL against the course.
      const fileUrl = await uploadToCloudinary(file)
      const res = await createMaterial({
        title,
        file_url: fileUrl,
        course_id: courseId,
      })
      if (res?.status === "success") {
        toast.success("Material uploaded")
        setOpen(false)
        resetForm()
        router.refresh()
      } else {
        toast.error(res?.message || "Failed to upload material")
      }
    } catch (e: any) {
      toast.error(e?.message || "Upload failed")
    } finally {
      setBusy(false)
    }
  }

  /**
   * Ask Claude for practice questions from this material. The set is saved as
   * an unpublished draft, so nothing reaches a student here — the tutor is
   * sent to the practice page to read and edit it before publishing.
   */
  const handleGenerate = async (id: string) => {
    try {
      setGeneratingId(id)
      const res = await generatePracticeSet(id)
      if (res?.status === "success") {
        toast.success("Draft questions ready — review them before publishing")
        router.push("/dashboard/practice")
      } else {
        toast.error(res?.message || "Could not generate questions")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setGeneratingId(null)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      setDeletingId(id)
      const res = await deleteMaterial(id)
      if (res?.status === "success") {
        toast.success("Material deleted")
        router.refresh()
      } else {
        toast.error(res?.message || "Failed to delete")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setDeletingId(null)
    }
  }

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <FolderOpen className="h-6 w-6" />
          Course Materials
        </h1>

        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) resetForm()
          }}
        >
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="h-4 w-4" />
              Upload Material
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Upload Material</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Week 1 Lecture Notes"
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Course</label>
                <Select onValueChange={setCourseId} value={courseId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                  <SelectContent>
                    {courses.map((c) => (
                      <SelectItem key={c.id} value={c.id}>
                        {c.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">File</label>
                <Input
                  type="file"
                  onChange={(e) => setFile(e.target.files?.[0] ?? null)}
                />
                <p className="text-xs text-muted-foreground">
                  Upload PDFs to let students generate summaries and practice
                  quizzes from them.
                </p>
              </div>
            </div>
            <DialogFooter>
              <Button onClick={handleUpload} disabled={busy}>
                {busy ? "Uploading..." : "Upload"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {materials.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No materials yet. Upload your first one above.
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {materials.map((m) => (
            <div key={m.id} className="rounded-lg border p-4 space-y-3">
            <div className="flex flex-wrap items-center gap-2 sm:gap-4">
              <div className="min-w-0 flex-1 basis-full sm:basis-auto">
                <div className="font-medium truncate">{m.title}</div>
                <Badge variant="outline" className="mt-1">
                  {m.course?.name ?? "Course"}
                </Badge>
              </div>
              {isPdf(m.file_url) && (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={summarisingId === m.id}
                    onClick={() => handleSummary(m.id)}
                  >
                    {summaryOpenId === m.id ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <FileText className="h-4 w-4" />
                    )}
                    {summarisingId === m.id
                      ? "Summarising..."
                      : summaryOpenId === m.id
                        ? "Hide summary"
                        : "Summary"}
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="gap-1"
                    disabled={generatingId === m.id}
                    onClick={() => handleGenerate(m.id)}
                  >
                    <Sparkles className="h-4 w-4" />
                    {generatingId === m.id ? "Generating..." : "Quiz for the course"}
                  </Button>
                </>
              )}
              <Button asChild size="sm" variant="outline" className="gap-1">
                <a href={m.file_url} target="_blank" rel="noopener noreferrer">
                  <Download className="h-4 w-4" />
                  Open
                </a>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label="Delete material"
                    className="text-destructive hover:text-destructive"
                    disabled={deletingId === m.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Material</AlertDialogTitle>
                    <AlertDialogDescription>
                      {`"${m.title}" will no longer be available to students in this course. This action cannot be undone.`}
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                      onClick={() => handleDelete(m.id)}
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </div>
            {summaryOpenId === m.id && summaries[m.id] && (
              <div className="space-y-2">
                <SummaryPanel summary={summaries[m.id]} />
                <Button
                  size="sm"
                  variant="ghost"
                  className="gap-1 text-xs"
                  disabled={summarisingId === m.id}
                  onClick={() => handleSummary(m.id, true)}
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate summary
                </Button>
              </div>
            )}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
