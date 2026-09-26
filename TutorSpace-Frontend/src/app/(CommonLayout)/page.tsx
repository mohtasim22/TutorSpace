// app/(CommonLayout)/page.tsx
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Star, BookOpen, Clock, ArrowRight, CheckCircle, GraduationCap, ShieldCheck, Zap, Users } from "lucide-react"
import { getAllTutors } from "@/services/tutor"
import { formatBDT, formatRate, TAKA } from "@/lib/currency"

export const dynamic = "force-dynamic"

export default async function HomePage() {
  let featuredTutors: any[] = []

  try {
    const data = await getAllTutors()
    const tutors = data?.tutor ?? data?.tutors ?? []
    featuredTutors = Array.isArray(tutors)
      ? tutors
        .sort((a: any, b: any) => (b.rating_avg || 0) - (a.rating_avg || 0))
        .slice(0, 3)
      : []
  } catch {
    featuredTutors = []
  }

  return (
    <div className="min-h-screen relative">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-violet-500/10 rounded-full blur-[100px] -z-10" />

      {/* Hero Section */}
      <section className="py-24 md:py-48 px-6 text-center relative overflow-hidden">
        <div className="container mx-auto">
          <Badge variant="secondary" className="text-[10px] md:text-[12px] uppercase tracking-wider font-bold p-2 h-6 bg-indigo-500/20 text-indigo-300 border-indigo-500/30 mb-8 animate-in fade-in slide-in-from-top-4 duration-1000">Learn from the best verified tutors</Badge>

          <h1 className="text-4xl md:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.2] md:leading-[1.1] animate-in fade-in slide-in-from-top-6 duration-1000 delay-100">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              Find the right tutor for your
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400 drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">
              learning journey
            </span>
          </h1>

          <p className="text-slate-400 max-w-xl mx-auto text-base md:text-xl leading-relaxed mt-8 animate-in fade-in slide-in-from-top-8 duration-1000 delay-200 px-2">
            Book one-on-one sessions with verified tutors. Learn at your own pace, on your own schedule with our glassy-smooth platform.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-300">
            <Link href="/course-slots">
              <Button size="lg" className="rounded-full px-8 bg-indigo-600 hover:bg-indigo-700 shadow-[0_0_20px_rgba(79,70,229,0.4)] transition-all hover:scale-105 active:scale-95 group">
                Browse Slots
                <ArrowRight className="ml-2 h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link href="/tutors">
              <Button size="lg" variant="outline" className="rounded-full px-8 border-white/10 bg-white/5 backdrop-blur-md hover:bg-white/10 transition-all hover:scale-105 active:scale-95">
                Meet Tutors
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 border-y border-white/5 bg-white/[0.02] backdrop-blur-sm">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">500+</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Verified Tutors</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">10k+</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Students</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">50+</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Subjects</div>
            </div>
            <div className="text-center space-y-2">
              <div className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">4.9/5</div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider">Avg Rating</div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24 relative overflow-hidden">
        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center space-y-4 mb-16">
            <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">How it works</h2>
            <p className="text-slate-400 mx-auto max-w-lg">
              Unlock your potential with our three-step process designed for fast, effective learning.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Users className="h-24 w-24 text-white" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.2)]">1</div>
              <h3 className="text-xl font-bold mb-3 text-white">Find a Tutor</h3>
              <p className="text-slate-400 leading-relaxed text-sm">Browse through our curated list of expert tutors and select the one that matches your goals.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Clock className="h-24 w-24 text-white" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-violet-500/20 text-violet-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(139,92,246,0.2)]">2</div>
              <h3 className="text-xl font-bold mb-3 text-white">Book a Slot</h3>
              <p className="text-slate-400 leading-relaxed text-sm">Choose a time that works for you and secure your one-on-one session with a simple booking.</p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all group relative overflow-hidden">
              <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                <Zap className="h-24 w-24 text-white" />
              </div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform shadow-[0_0_15px_rgba(99,102,241,0.2)]">3</div>
              <h3 className="text-xl font-bold mb-3 text-white">Start Learning</h3>
              <p className="text-slate-400 leading-relaxed text-sm">Join your session via our built-in video system and start mastering your chosen subject.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Tutors Section */}
      <section className="py-24 bg-white/[0.01]">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-end justify-between gap-6 mb-12">
            <div className="space-y-4 text-left">
              <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">Featured Tutors</h2>
              <p className="text-slate-400 max-w-md">
                Learn from industry experts and highly-rated educators who are verified for quality.
              </p>
            </div>
            <Button asChild variant="outline" className="rounded-full border-white/10 bg-white/5 hover:bg-white/10">
              <Link href="/tutors" className="flex items-center gap-2">
                View All Tutors <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>

          {!featuredTutors?.length ? (
            <div className="py-20 text-center rounded-3xl border border-white/5 bg-white/5 backdrop-blur-sm">
              <p className="text-slate-500">No tutors available at the moment. Check back soon!</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredTutors.map((tutor: any) => {
                const initials = tutor.display_name
                  ?.split(" ")
                  .map((n: string) => n[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase() || "T"

                return (
                  <Card key={tutor.id} className="group hover:bg-white/5 transition-all duration-300 border-white/5 bg-white/[0.02] backdrop-blur-xl overflow-hidden rounded-3xl">
                    <CardContent className="p-6 space-y-6">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-4">
                          <Avatar className="h-14 w-14 border-2 border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                            <AvatarFallback className="bg-gradient-to-br from-indigo-500/20 to-violet-500/20 text-indigo-300">
                              {initials}
                            </AvatarFallback>
                          </Avatar>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors truncate">
                                {tutor.display_name}
                              </h3>
                              {tutor.is_verified && (
                                <ShieldCheck className="h-4 w-4 text-indigo-400 shrink-0" />
                              )}
                            </div>
                            <p className="text-xs text-slate-500 font-medium uppercase tracking-tight flex items-center gap-1">
                              <GraduationCap className="h-3 w-3" />
                              {tutor.qualification}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-1 bg-white/5 px-2 py-1 rounded-lg border border-white/10">
                          <Star className="h-3 w-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs font-bold text-white">{tutor.rating_avg || "5.0"}</span>
                        </div>
                      </div>

                      <p className="text-sm text-slate-400 line-clamp-2 leading-relaxed h-10">
                        {tutor.bio || "An expert educator dedicated to helping students achieve their academic goals and excel in their studies."}
                      </p>

                      <div className="flex items-center justify-between pt-4 border-t border-white/5">
                        <div className="text-sm font-bold text-white flex items-center gap-1">
                          <span className="text-indigo-400">{TAKA}</span>
                          {Number(tutor.hourly_rate || 800).toLocaleString("en-US")}<span className="text-[10px] text-slate-500 font-normal">/hr</span>
                        </div>
                        <Button asChild size="sm" className="rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 hover:bg-indigo-500/20">
                          <Link href={`/tutors/${tutor.id}`}>View Profile</Link>
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="py-16 md:py-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-indigo-600/5 mix-blend-overlay -z-10" />
        <div className="container mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">Ready to start learning?</h2>
          <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg leading-relaxed px-4">
            Join thousands of students who are already mastering new skills with TutorSpace. Get started today and find your perfect tutor.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-10 bg-indigo-600 hover:bg-indigo-700 shadow-xl transition-all">
              <Link href="/register">Create Your Account</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-10 border-white/10 bg-white/5 backdrop-blur-md">
              <Link href="/course-slots">Browse All Slots</Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}