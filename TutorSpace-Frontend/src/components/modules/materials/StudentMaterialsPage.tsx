import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { FolderOpen, Download } from "lucide-react"

type Material = {
  id: string
  title: string
  file_url: string
  course?: { name?: string }
}

export default function StudentMaterialsPage({
  materials,
}: {
  materials: Material[]
}) {
  // Group materials by course so each course's resources sit together.
  const grouped = materials.reduce<Record<string, Material[]>>((acc, m) => {
    const key = m.course?.name ?? "Course"
    ;(acc[key] ??= []).push(m)
    return acc
  }, {})
  const courseNames = Object.keys(grouped)

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold flex items-center gap-2">
        <FolderOpen className="h-6 w-6" />
        Course Materials
      </h1>

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
              {grouped[course].map((m) => (
                <div
                  key={m.id}
                  className="rounded-lg border p-4 flex items-center gap-4"
                >
                  <span className="min-w-0 flex-1 font-medium truncate">
                    {m.title}
                  </span>
                  <Button asChild size="sm" variant="outline" className="gap-1">
                    <a
                      href={m.file_url}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </a>
                  </Button>
                </div>
              ))}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
