"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Star, User, BookOpen, Link, CheckCircle, ArrowLeft } from "lucide-react"
import BookSlotButton from "@/components/modules/courseSlots/BookSlotButton"
import { use, useEffect, useState } from "react"
import { getSingleSlot } from "@/services/courseSlots"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { formatBDT, formatRate, TAKA } from "@/lib/currency"

export default function CourseSlotDetails({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = use(params)
  const [slot, setSlot] = useState<any>(null)
  const router = useRouter()

  useEffect(() => {
    getSingleSlot(id).then((res) => setSlot(res.slot))
  }, [id])

  if (!slot) return null

  const start = new Date(slot.start_time);
  const end = new Date(slot.end_time);
  const date = new Date(slot.date);

  const durationHours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
  const durationMinutes = Math.round(durationHours * 60)
  const estimatedPrice = slot.tutor?.hourly_rate ? slot.tutor.hourly_rate * durationHours : null

  return (
    <div className="min-h-screen relative py-20 px-4">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-5%] left-[-10%] w-[30%] h-[30%] bg-indigo-500/10 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-[10%] right-[-5%] w-[25%] h-[25%] bg-violet-500/10 rounded-full blur-[80px] -z-10" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-3xl mx-auto space-y-6 relative z-10"
      >
        <Button
          variant="ghost"
          onClick={() => router.back()}
          className="text-slate-400 hover:text-white -ml-4"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to slots
        </Button>

        <Card className="border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden rounded-3xl">
          <CardHeader className="border-b border-white/5 bg-white/[0.01] p-8">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <CardTitle className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">
                  {slot.course.name}
                </CardTitle>
                <p className="text-slate-400 font-medium">{slot.name}</p>
              </div>
              <Badge variant="secondary" className="w-fit bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                {slot.course.status}
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="p-8 space-y-8">
            {/* Description */}
            <div className="space-y-3">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-500">About this session</h3>
              <p className="text-slate-300 leading-relaxed">{slot.description}</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Date & Time */}
              <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
                <h3 className="font-bold flex items-center gap-2 text-white">
                  <Calendar className="h-5 w-5 text-indigo-400" />
                  Schedule
                </h3>
                <div className="space-y-3">
                  <div className="flex gap-3 items-center text-sm text-slate-400">
                    <Calendar className="h-4 w-4" />
                    {date.toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                  </div>
                  <div className="flex gap-3 items-center text-sm text-slate-400">
                    <Clock className="h-4 w-4" />
                    {start.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — {end.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <Badge variant="outline" className="bg-indigo-500/10 border-indigo-500/20 text-indigo-200">
                    {durationMinutes} Minutes Session
                  </Badge>
                </div>
              </div>

              {/* Pricing */}
              {estimatedPrice && (
                <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4 shadow-[0_0_20px_rgba(34,197,94,0.05)]">
                  <h3 className="font-bold flex items-center gap-2 text-white">
                    <span className="text-lg font-bold text-green-400 leading-none">{TAKA}</span>
                    Pricing Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Tutor Rate</span>
                      <span className="font-bold text-white">{formatRate(slot.tutor.hourly_rate)}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-slate-400">Duration</span>
                      <span className="font-bold text-white">{durationHours.toFixed(1)} hrs</span>
                    </div>
                    <div className="border-t border-white/5 pt-3 mt-3 flex items-center justify-between">
                      <span className="font-bold text-white uppercase text-xs tracking-widest">Estimated Total</span>
                      <span className="text-2xl font-black text-green-400">{formatBDT(estimatedPrice)}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Tutor Info */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6 space-y-4">
              <h3 className="font-bold flex items-center gap-2 text-white">
                <User className="h-5 w-5 text-indigo-400" />
                Your Expert Tutor
              </h3>
              <div className="flex flex-col md:flex-row md:items-center gap-6">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 rounded-full bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-xl shadow-lg">
                    {slot.tutor.display_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-lg text-white">{slot.tutor.display_name}</span>
                      {slot.tutor.is_verified && (
                        <CheckCircle className="h-4 w-4 text-indigo-400 shadow-[0_0_10px_rgba(99,102,241,0.5)]" />
                      )}
                    </div>
                    <p className="text-xs text-indigo-300 font-bold uppercase tracking-tight">{slot.tutor.qualification}</p>
                  </div>
                </div>
                <div className="flex items-center gap-1 bg-white/5 px-3 py-1.5 rounded-xl border border-white/10 text-sm">
                  <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
                  <span className="font-bold text-white">{slot.tutor.rating_avg}</span>
                  <span className="text-slate-500 hidden sm:inline ml-1">({slot.tutor.total_reviews} reviews)</span>
                </div>
              </div>
              <p className="text-sm text-slate-400 leading-relaxed italic border-l-2 border-indigo-500/20 pl-4">
                "{slot.tutor.bio || "An expert educator dedicated to helping students achieve their academic goals and excel in their studies."}"
              </p>
            </div>

            {/* Booking Button */}
            <div className="pt-4 flex justify-center">
              <BookSlotButton
                slotId={slot.id}
                tutorId={slot.tutor_id}
              />
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
}