import { Skeleton } from "@/components/ui/skeleton"
import { Card, CardContent, CardHeader } from "@/components/ui/card"

/**
 * Loading skeletons for the dashboard routes.
 *
 * Every dashboard segment has a `loading.tsx` that renders one of the page
 * presets below. That file is what creates the Suspense boundary: without it
 * Next.js keeps the user on the previous page — with no visual change at all —
 * until the server render and every await inside it have finished, so clicking
 * a sidebar tab looks like nothing happened. These presets make the shell swap
 * immediately and show the shape of the page that is arriving.
 *
 * The shapes deliberately mirror the real pages (same container, same header,
 * same table/card structure) so the transition to real content doesn't jump.
 */

// Shared page container — matches the real pages.
function PageShell({ children }: { children: React.ReactNode }) {
  return <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">{children}</div>
}

// Title on the left, optional action button on the right.
function HeaderSkeleton({ action = true }: { action?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <Skeleton className="h-8 w-48" />
      {action && <Skeleton className="h-9 w-32" />}
    </div>
  )
}

// Row of summary/stat cards.
function StatCards({ count = 4 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="pb-2">
            <Skeleton className="h-4 w-24" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-7 w-16" />
            <Skeleton className="h-3 w-20" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// A card wrapping a table.
function TableCard({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <Card>
      <CardHeader>
        <Skeleton className="h-5 w-32" />
      </CardHeader>
      <CardContent className="space-y-3">
        {/* header row */}
        <div className="flex gap-4 pb-2 border-b">
          {Array.from({ length: cols }).map((_, i) => (
            <Skeleton key={i} className="h-4 flex-1" />
          ))}
        </div>
        {/* body rows */}
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="flex gap-4 py-1">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton key={c} className="h-4 flex-1" />
            ))}
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

// Stacked list of content cards (assignments, materials, announcements, reviews).
function CardList({ count = 4, lines = 2 }: { count?: number; lines?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="flex flex-row items-start justify-between gap-4 pb-3">
            <div className="space-y-2 flex-1">
              <Skeleton className="h-5 w-1/3" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-8 w-24 shrink-0" />
          </CardHeader>
          <CardContent className="space-y-2">
            {Array.from({ length: lines }).map((_, l) => (
              <Skeleton key={l} className={l === lines - 1 ? "h-3 w-2/3" : "h-3 w-full"} />
            ))}
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

// Responsive grid of cards (courses, tutors).
function CardGrid({ count = 6 }: { count?: number }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: count }).map((_, i) => (
        <Card key={i}>
          <CardHeader className="space-y-2">
            <Skeleton className="h-5 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </CardHeader>
          <CardContent className="space-y-2">
            <Skeleton className="h-3 w-full" />
            <Skeleton className="h-3 w-4/5" />
            <Skeleton className="h-9 w-full mt-3" />
          </CardContent>
        </Card>
      ))}
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Page presets — these are what the loading.tsx files render.          */
/* ------------------------------------------------------------------ */

/** Table-shaped page: slots, bookings, users, admin lists. */
export function TablePageSkeleton({ cols = 5, rows = 6 }: { cols?: number; rows?: number }) {
  return (
    <PageShell>
      <HeaderSkeleton />
      <TableCard cols={cols} rows={rows} />
    </PageShell>
  )
}

/** Stacked-cards page: assignments, materials, announcements, reviews. */
export function ListPageSkeleton({ count = 4, action = true }: { count?: number; action?: boolean }) {
  return (
    <PageShell>
      <HeaderSkeleton action={action} />
      <CardList count={count} />
    </PageShell>
  )
}

/** Grid page: courses. */
export function GridPageSkeleton({ count = 6 }: { count?: number }) {
  return (
    <PageShell>
      <HeaderSkeleton />
      <CardGrid count={count} />
    </PageShell>
  )
}

/** Dashboard overview: stat cards, a highlighted next-session card, two lists. */
export function OverviewSkeleton() {
  return (
    <PageShell>
      <div className="space-y-2">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-40" />
      </div>

      <StatCards count={4} />

      {/* next session highlight */}
      <Card>
        <CardHeader className="pb-3">
          <Skeleton className="h-5 w-36" />
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <div className="space-y-2 flex-1">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-3 w-1/4" />
          </div>
          <Skeleton className="h-9 w-28 shrink-0" />
        </CardContent>
      </Card>

      <div className="grid gap-4 lg:grid-cols-2">
        {[0, 1].map((i) => (
          <Card key={i}>
            <CardHeader className="pb-3">
              <Skeleton className="h-5 w-32" />
            </CardHeader>
            <CardContent className="space-y-3">
              {[0, 1, 2].map((r) => (
                <div key={r} className="space-y-2">
                  <Skeleton className="h-4 w-3/4" />
                  <Skeleton className="h-3 w-1/2" />
                </div>
              ))}
            </CardContent>
          </Card>
        ))}
      </div>
    </PageShell>
  )
}

/** Stat cards above a table: tutor earnings. */
export function StatsTablePageSkeleton({ cols = 5 }: { cols?: number }) {
  return (
    <PageShell>
      <HeaderSkeleton action={false} />
      <StatCards count={3} />
      <TableCard cols={cols} rows={6} />
    </PageShell>
  )
}

/** Month grid: calendar. */
export function CalendarPageSkeleton() {
  return (
    <PageShell>
      <HeaderSkeleton />
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <Skeleton className="h-5 w-40" />
          <div className="flex gap-2">
            <Skeleton className="h-8 w-8" />
            <Skeleton className="h-8 w-8" />
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {Array.from({ length: 7 }).map((_, i) => (
              <Skeleton key={`h-${i}`} className="h-4 w-full" />
            ))}
            {Array.from({ length: 35 }).map((_, i) => (
              <Skeleton key={`d-${i}`} className="h-16 w-full rounded-md" />
            ))}
          </div>
        </CardContent>
      </Card>
    </PageShell>
  )
}

/** Single form: profile settings. */
export function FormPageSkeleton({ fields = 5 }: { fields?: number }) {
  return (
    <PageShell>
      <HeaderSkeleton action={false} />
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-5 w-40" />
          <Skeleton className="h-3 w-64" />
        </CardHeader>
        <CardContent className="space-y-5">
          {Array.from({ length: fields }).map((_, i) => (
            <div key={i} className="space-y-2">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-9 w-full" />
            </div>
          ))}
          <Skeleton className="h-10 w-32" />
        </CardContent>
      </Card>
    </PageShell>
  )
}

/** Assignment detail with its submission table. */
export function DetailWithTableSkeleton() {
  return (
    <PageShell>
      <Skeleton className="h-8 w-20" />
      <Card>
        <CardHeader className="space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-3 w-32" />
        </CardHeader>
        <CardContent className="space-y-2">
          <Skeleton className="h-3 w-full" />
          <Skeleton className="h-3 w-5/6" />
        </CardContent>
      </Card>
      <TableCard cols={5} rows={5} />
    </PageShell>
  )
}

/** Full-bleed session surface: video call and whiteboard. */
export function SessionSurfaceSkeleton({ label = "Loading session…" }: { label?: string }) {
  return (
    <div className="max-w-7xl mx-auto py-6 px-4 space-y-4">
      <div className="flex items-center justify-between gap-3">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-5 w-56" />
        <Skeleton className="h-8 w-32" />
      </div>
      <div className="relative h-[80vh] rounded-xl border overflow-hidden">
        <Skeleton className="h-full w-full rounded-none" />
        <div className="absolute inset-0 flex items-center justify-center text-sm text-muted-foreground">
          {label}
        </div>
      </div>
    </div>
  )
}
