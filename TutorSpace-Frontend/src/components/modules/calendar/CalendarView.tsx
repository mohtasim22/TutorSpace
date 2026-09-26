"use client"

import { useMemo, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  Clock,
  Users,
  Link2,
} from "lucide-react"

// A normalized calendar event. Each dashboard page maps its own data
// (a student's bookings, or a tutor's created slots) into this common shape,
// so the calendar itself doesn't care which one it's showing.
export type CalendarEvent = {
  id: string
  title: string
  start: string // ISO datetime
  end: string // ISO datetime
  date: string // ISO datetime for the day the session falls on
  capacity?: number // total seats on the slot
  bookedCount?: number // how many students have booked it
  courseSlotId?: string // the slot id — used to open the in-app video room
  meetingLink?: string
}

interface Props {
  events: CalendarEvent[]
}

const WEEKDAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]

// Build a LOCAL "YYYY-MM-DD" key. We use the local date parts (not toISOString,
// which is UTC) so a session doesn't jump to the wrong day in non-UTC timezones.
const dateKey = (d: Date) =>
  `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(
    d.getDate()
  ).padStart(2, "0")}`

const fmtTime = (iso: string) =>
  new Date(iso).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })

export default function CalendarView({ events }: Props) {
  const today = new Date()
  const todayKey = dateKey(today)

  // `cursor` is always the 1st of the month currently on screen.
  const [cursor, setCursor] = useState(
    new Date(today.getFullYear(), today.getMonth(), 1)
  )
  const [selected, setSelected] = useState<string>(todayKey)

  // Group every event under its day key, then sort each day by start time.
  const byDay = useMemo(() => {
    const map: Record<string, CalendarEvent[]> = {}
    for (const e of events) {
      if (!e?.date) continue
      const key = dateKey(new Date(e.date))
      ;(map[key] ??= []).push(e)
    }
    for (const k in map) {
      map[k].sort((a, b) => +new Date(a.start) - +new Date(b.start))
    }
    return map
  }, [events])

  // Lay out the month as a flat list of cells: leading blanks for the offset
  // of the 1st, then each day, then trailing blanks to complete the last week.
  const cells = useMemo(() => {
    const year = cursor.getFullYear()
    const month = cursor.getMonth()
    const firstWeekday = new Date(year, month, 1).getDay() // 0 (Sun) – 6 (Sat)
    const daysInMonth = new Date(year, month + 1, 0).getDate()

    const arr: (Date | null)[] = []
    for (let i = 0; i < firstWeekday; i++) arr.push(null)
    for (let d = 1; d <= daysInMonth; d++) arr.push(new Date(year, month, d))
    while (arr.length % 7 !== 0) arr.push(null)
    return arr
  }, [cursor])

  const monthLabel = cursor.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  })
  const selectedEvents = byDay[selected] ?? []

  const goPrev = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))
  const goNext = () =>
    setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))
  const goToday = () => {
    setCursor(new Date(today.getFullYear(), today.getMonth(), 1))
    setSelected(todayKey)
  }

  // Pretty label for the selected day, e.g. "Tuesday, Aug 12, 2026".
  const selectedLabel = (() => {
    const [y, m, d] = selected.split("-").map(Number)
    return new Date(y, m - 1, d).toLocaleDateString(undefined, {
      weekday: "long",
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  })()

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-0 sm:px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <CalendarDays className="h-6 w-6" />
          My Calendar
        </h1>
        <Badge variant="outline">{events.length} sessions</Badge>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ---- Month grid ---- */}
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 space-y-0">
            <CardTitle className="text-base">{monthLabel}</CardTitle>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" onClick={goToday}>
                Today
              </Button>
              <Button variant="ghost" size="icon" aria-label="Previous month" onClick={goPrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" aria-label="Next month" onClick={goNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {/* Weekday header row */}
            <div className="grid grid-cols-7 mb-2">
              {WEEKDAYS.map((w) => (
                <div
                  key={w}
                  className="text-center text-xs font-medium text-muted-foreground py-1"
                >
                  {w}
                </div>
              ))}
            </div>

            {/* Day cells */}
            <div className="grid grid-cols-7 gap-1">
              {cells.map((day, i) => {
                if (!day) return <div key={i} className="min-h-14 sm:min-h-20" />
                const key = dateKey(day)
                const dayEvents = byDay[key] ?? []
                const isToday = key === todayKey
                const isSelected = key === selected

                return (
                  <button
                    key={i}
                    onClick={() => setSelected(key)}
                    className={`min-h-14 sm:min-h-20 rounded-md border p-0.5 sm:p-1 text-left align-top transition-colors hover:bg-muted/50 ${
                      isSelected
                        ? "border-primary ring-1 ring-primary"
                        : "border-border"
                    }`}
                  >
                    <span
                      className={`inline-flex h-5 w-5 sm:h-6 sm:w-6 items-center justify-center rounded-full text-[11px] sm:text-xs ${
                        isToday
                          ? "bg-primary text-primary-foreground font-bold"
                          : "text-foreground"
                      }`}
                    >
                      {day.getDate()}
                    </span>

                    {/* Up to two pills, then a "+N more" hint. Clicking anywhere
                        in the cell selects the day and reveals the full list on
                        the right, so overflow is never lost. */}
                    {/* Phones: a single dot means "something is on this day".
                        The titles are unreadable at ~40px of cell width, and
                        tapping the day reveals them in full in the panel below. */}
                    {dayEvents.length > 0 && (
                      <div className="mt-1 flex justify-center sm:hidden">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                      </div>
                    )}

                    {/* Wider screens: the pills, as before. */}
                    <div className="mt-1 space-y-0.5 hidden sm:block">
                      {dayEvents.slice(0, 2).map((e) => (
                        <div
                          key={e.id}
                          className="truncate rounded border border-primary/25 bg-primary/15 px-1 py-0.5 text-[10px] text-primary"
                        >
                          {fmtTime(e.start)} {e.title}
                        </div>
                      ))}
                      {dayEvents.length > 2 && (
                        <div className="text-[10px] font-medium text-muted-foreground px-1">
                          +{dayEvents.length - 2} more
                        </div>
                      )}
                    </div>
                  </button>
                )
              })}
            </div>
          </CardContent>
        </Card>

        {/* ---- Selected-day detail (scrolls when a day is busy) ---- */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center justify-between">
              <span>{selectedLabel}</span>
              {selectedEvents.length > 0 && (
                <Badge variant="secondary" className="text-[10px]">
                  {selectedEvents.length}
                </Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[65vh] overflow-y-auto">
            {selectedEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground py-6 text-center">
                No sessions on this day.
              </p>
            ) : (
              selectedEvents.map((e) => (
                <div key={e.id} className="rounded-lg border p-3 space-y-2">
                  {/* Title */}
                  <span className="font-medium text-sm">{e.title}</span>

                  {/* Time */}
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="h-3 w-3" />
                    {fmtTime(e.start)} — {fmtTime(e.end)}
                  </div>

                  {/* Seats: how many booked out of capacity */}
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <Users className="h-3 w-3" />
                    {(e.bookedCount ?? 0)} / {e.capacity ?? 1} booked
                  </div>

                  {/* Join the in-app video room for this session */}
                  {e.courseSlotId && (
                    <Button
                      size="sm"
                      asChild
                      variant="outline"
                      className="w-full gap-2"
                    >
                      <a href={`/dashboard/call/${e.courseSlotId}`}>
                        <Link2 className="h-3 w-3" />
                        Join Meeting
                      </a>
                    </Button>
                  )}
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
