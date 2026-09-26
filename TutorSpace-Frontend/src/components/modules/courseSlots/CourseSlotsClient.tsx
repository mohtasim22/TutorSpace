"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import CourseSlotCard from "./slotCards"
import { motion, AnimatePresence } from "framer-motion"

type Slot = {
  id: string
  name: string
  start_time: string
  end_time: string
  date: string
  tutor: { display_name: string; hourly_rate: number }
  course: { name: string }
}

export default function CourseSlotsClient({ slots }: { slots: Slot[] }) {
  const [query, setQuery] = useState("")
  const [courseFilter, setCourseFilter] = useState("ALL")
  const [sortOrder, setSortOrder] = useState("NONE")

  const allCourses = Array.from(
    new Set(slots.map((s) => s.course.name))
  )

  const calculatePrice = (slot: Slot) => {
    const start = new Date(slot.start_time)
    const end = new Date(slot.end_time)
    const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return slot.tutor.hourly_rate * durationHours
  }

  const filtered = slots.filter((slot) => {
    const q = query.toLowerCase()

    const matchesSearch =
      !q ||
      slot.name?.toLowerCase().includes(q) ||
      slot.course?.name?.toLowerCase().includes(q) ||
      slot.tutor?.display_name?.toLowerCase().includes(q)

    const matchesCourse =
      courseFilter === "ALL" || slot.course.name === courseFilter

    return matchesSearch && matchesCourse
  })

  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "PRICE_ASC") return calculatePrice(a) - calculatePrice(b)
    if (sortOrder === "PRICE_DESC") return calculatePrice(b) - calculatePrice(a)
    return 0
  })

  const hasActiveFilters = query || courseFilter !== "ALL" || sortOrder !== "NONE"

  const clearFilters = () => {
    setQuery("")
    setCourseFilter("ALL")
    setSortOrder("NONE")
  }

  return (
    <div className="min-h-screen relative py-20">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-5%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] w-[25%] h-[25%] bg-violet-500/10 rounded-full blur-[80px] -z-10" />

      <div className="container mx-auto px-4 relative z-10 space-y-6">
        <div className="flex items-center justify-between">
          <div className="space-y-1">
            <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Course Slots</h1>

          </div>
          <Badge className="text-sm px-3 py-1" variant="outline">{sorted.length} slots</Badge>
        </div>

        {/* Search & Filters Bar */}
        <div className="bg-white/5 border border-white/10 p-5 rounded-2xl backdrop-blur-md flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-[5] w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-indigo-400" />
            <Input
              placeholder="Search by slot, course or tutor..."
              className="pl-9 h-10 bg-white/5 border-white/10"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>

          <Select value={courseFilter} onValueChange={setCourseFilter}>
            <SelectTrigger className="w-full md:w-44 bg-white/5 border-white/10 backdrop-blur-sm h-9">
              <SelectValue placeholder="Filter by course" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/90 border-white/10 backdrop-blur-xl">
              <SelectItem value="ALL">All Courses</SelectItem>
              {allCourses.map((course) => (
                <SelectItem key={course} value={course}>
                  {course}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select value={sortOrder} onValueChange={setSortOrder}>
            <SelectTrigger className="w-full md:w-44 bg-white/5 border-white/10 backdrop-blur-sm h-9">
              <SelectValue placeholder="Sort by Price" />
            </SelectTrigger>
            <SelectContent className="bg-slate-900/90 border-white/10 backdrop-blur-xl">
              <SelectItem value="NONE">Default Order</SelectItem>
              <SelectItem value="PRICE_ASC">Price: Low to High</SelectItem>
              <SelectItem value="PRICE_DESC">Price: High to Low</SelectItem>
            </SelectContent>
          </Select>

          {hasActiveFilters && (
            <Button variant="outline" onClick={clearFilters} className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50 h-9">
              <X className="h-4 w-4 mr-1" />
              Clear
            </Button>
          )}
        </div>

        {hasActiveFilters && (
          <div className="flex flex-wrap gap-2 mb-6">
            {query && (
              <Badge variant="secondary" className="bg-white/5 border-white/10 text-slate-300">
                Search: "{query}"
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setQuery("")} />
              </Badge>
            )}
            {courseFilter !== "ALL" && (
              <Badge variant="secondary" className="bg-white/5 border-white/10 text-slate-300">
                Course: {courseFilter}
                <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setCourseFilter("ALL")} />
              </Badge>
            )}
            <p className="text-sm text-slate-500 self-center">
              Found {sorted.length} result{sorted.length !== 1 ? "s" : ""}
            </p>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          {sorted.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="text-center py-24 rounded-3xl border border-white/5 bg-white/5 backdrop-blur-md"
            >
              <p className="text-slate-500 text-lg">No sessions found matching your search.</p>
            </motion.div>
          ) : (
            <motion.div
              layout
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6"
            >
              {sorted.map((slot, index) => (
                <motion.div
                  key={slot.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <CourseSlotCard slot={slot} />
                </motion.div>
              ))}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}