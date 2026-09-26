// app/(CommonLayout)/search/page.tsx
import Link from "next/link"
import { searchAll } from "@/services/search"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GraduationCap, BookOpen, Search, ArrowRight } from "lucide-react"
import { formatBDT, formatRate, TAKA } from "@/lib/currency"

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>
}) {
  const { q = "" } = await searchParams
  const query = q.trim()
  const data = query ? await searchAll(query) : { tutors: [], courses: [] }
  const tutors: any[] = data?.tutors ?? []
  const courses: any[] = data?.courses ?? []
  const empty = tutors.length === 0 && courses.length === 0

  return (
    <div className="max-w-5xl mx-auto px-4 pt-28 pb-16 space-y-8">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Search className="h-6 w-6" />
          Search results
        </h1>
        {query && (
          <p className="text-sm text-muted-foreground mt-1">
            for <span className="font-medium text-foreground">“{query}”</span>
          </p>
        )}
      </div>

      {!query ? (
        <p className="text-muted-foreground">Type something to search tutors and courses.</p>
      ) : empty ? (
        <Card>
          <CardContent className="py-12 text-center text-muted-foreground">
            No tutors or courses matched “{query}”.
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Tutors */}
          {tutors.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <GraduationCap className="h-5 w-5" /> Tutors
                <Badge variant="secondary" className="text-[10px]">{tutors.length}</Badge>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {tutors.map((t) => (
                  <Link key={t.id} href={`/tutors/${t.id}`}>
                    <Card className="h-full transition-colors hover:border-primary">
                      <CardContent className="pt-6 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{t.display_name}</p>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        <p className="text-xs text-muted-foreground">{t.qualification}</p>
                        <p className="text-sm text-muted-foreground line-clamp-2">{t.bio}</p>
                        <p className="text-xs font-medium pt-1">{formatRate(t.hourly_rate)}</p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {/* Courses */}
          {courses.length > 0 && (
            <section className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <BookOpen className="h-5 w-5" /> Courses
                <Badge variant="secondary" className="text-[10px]">{courses.length}</Badge>
              </h2>
              <div className="grid gap-3 sm:grid-cols-2">
                {courses.map((c) => (
                  <Link key={c.id} href={`/tutors/${c.tutor_id}`}>
                    <Card className="h-full transition-colors hover:border-primary">
                      <CardContent className="pt-6 space-y-1">
                        <div className="flex items-center justify-between">
                          <p className="font-medium">{c.name}</p>
                          <ArrowRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                        {c.tutor?.display_name && (
                          <p className="text-xs text-muted-foreground">
                            by {c.tutor.display_name}
                          </p>
                        )}
                        <p className="text-sm text-muted-foreground line-clamp-2">
                          {c.description}
                        </p>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
            </section>
          )}
        </>
      )}
    </div>
  )
}
