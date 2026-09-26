
"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import TutorProfileCard from "./tutorCards"
import { motion, AnimatePresence } from "framer-motion"

type Tutor = {
  id: string
  display_name: string
  bio: string
  qualification: string
  rating_avg: number
  total_reviews: number
  is_verified: boolean
  hourly_rate: number
  courses?: { name: string }[]
  slots?: { name: string }[]
}

export default function TutorsClient({ tutors }: { tutors: Tutor[] }) {
  const [query, setQuery] = useState("")
  const [ratingFilter, setRatingFilter] = useState("ALL")
  const [courseFilter, setCourseFilter] = useState("ALL")
  const [sortOrder, setSortOrder] = useState("NONE")


  const allCourses = Array.from(
    new Set(
      tutors.flatMap((t) => t.courses?.map((c) => c.name) ?? [])
    )
  )

  const filtered = tutors.filter((tutor) => {
    const q = query.toLowerCase()


    const matchesSearch =
      !q ||
      tutor.display_name.toLowerCase().includes(q) ||
      tutor.courses?.some((c) => c.name.toLowerCase().includes(q)) ||
      tutor.slots?.some((s) => s.name.toLowerCase().includes(q))


    const matchesRating =
      ratingFilter === "ALL" ||
      tutor.rating_avg >= parseInt(ratingFilter)


    const matchesCourse =
      courseFilter === "ALL" ||
      tutor.courses?.some((c) => c.name === courseFilter)

    return matchesSearch && matchesRating && matchesCourse
  })

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOrder === "PRICE_ASC") return a.hourly_rate - b.hourly_rate
    if (sortOrder === "PRICE_DESC") return b.hourly_rate - a.hourly_rate
    return 0
  })

  const hasActiveFilters = query || ratingFilter !== "ALL" || courseFilter !== "ALL" || sortOrder !== "NONE"

  const clearFilters = () => {
    setQuery("")
    setRatingFilter("ALL")
    setCourseFilter("ALL")
    setSortOrder("NONE")
  }

  return (
    <div className="container mx-auto px-4 py-20 space-y-6 ">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Tutors</h1>
        <Badge className="text-sm px-3 py-1" variant="outline">{sorted.length} tutors</Badge>
      </div>

      {/* Search & Filters */}
      <div className="bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md flex flex-col md:flex-row gap-3">
        {/* Search */}
        <div className="relative flex-[5] md:min-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-indigo-400" />
          <Input
            placeholder="Search by tutor, course or slot..."
            className="pl-9 h-9 bg-white/5 border-white/10"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>

        {/* Rating Filter */}
        <Select value={ratingFilter} onValueChange={setRatingFilter}>
          <SelectTrigger className="w-full md:w-36 bg-white/5 border-white/10 backdrop-blur-sm">
            <SelectValue placeholder="Rating" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900/90 border-white/10 backdrop-blur-xl">
            <SelectItem value="ALL">All Ratings</SelectItem>
            <SelectItem value="5">5★ only</SelectItem>
            <SelectItem value="4">4★ & above</SelectItem>
            <SelectItem value="3">3★ & above</SelectItem>
            <SelectItem value="2">2★ & above</SelectItem>
          </SelectContent>
        </Select>

        {/* Course Filter */}
        <Select value={courseFilter} onValueChange={setCourseFilter}>
          <SelectTrigger className="w-full md:w-40 bg-white/5 border-white/10 backdrop-blur-sm text-xs md:text-sm">
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

        {/* Price Sorting */}
        <Select value={sortOrder} onValueChange={setSortOrder}>
          <SelectTrigger className="w-full md:w-44 bg-white/5 border-white/10 backdrop-blur-sm">
            <SelectValue placeholder="Sort by Price" />
          </SelectTrigger>
          <SelectContent className="bg-slate-900/90 border-white/10 backdrop-blur-xl">
            <SelectItem value="NONE">Default Order</SelectItem>
            <SelectItem value="PRICE_ASC">Price: Low to High</SelectItem>
            <SelectItem value="PRICE_DESC">Price: High to Low</SelectItem>
          </SelectContent>
        </Select>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <Button variant="outline" onClick={clearFilters} className="border-indigo-500/30 text-indigo-400 hover:bg-indigo-500/10 hover:border-indigo-500/50">
            <X className="h-4 w-4 mr-1" />
            Clear
          </Button>
        )}
      </div>

      {/* Active filter badges */}
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {query && (
            <Badge variant="secondary">
              Search: "{query}"
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setQuery("")}
              />
            </Badge>
          )}
          {ratingFilter !== "ALL" && (
            <Badge variant="secondary">
              Rating: {ratingFilter}★+
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setRatingFilter("ALL")}
              />
            </Badge>
          )}
          {courseFilter !== "ALL" && (
            <Badge variant="secondary">
              Course: {courseFilter}
              <X
                className="h-3 w-3 ml-1 cursor-pointer"
                onClick={() => setCourseFilter("ALL")}
              />
            </Badge>
          )}
          <p className="text-sm text-muted-foreground self-center">
            {sorted.length} result{sorted.length !== 1 ? "s" : ""}
          </p>
        </div>
      )}

      {/* Tutors Grid */}
      <AnimatePresence mode="popLayout">
        {sorted.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="text-center py-20 text-muted-foreground"
          >
            No tutors found. Try adjusting your filters.
          </motion.div>
        ) : (
          <motion.div
            layout
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
          >
            {sorted.map((tutor, index) => (
              // h-full on the grid item lets the card inside stretch to the
              // row height instead of sitting at its own content height.
              <motion.div
                key={tutor.id}
                className="h-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <TutorProfileCard tutor={tutor} />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}