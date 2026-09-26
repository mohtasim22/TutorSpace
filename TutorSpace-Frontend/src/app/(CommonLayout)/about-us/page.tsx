// app/(CommonLayout)/about-us/page.tsx
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Users, Star, Shield, Target, Heart, ArrowRight } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

const values = [
  {
    icon: <Target className="h-5 w-5" />,
    title: "Quality First",
    desc: "Every tutor is verified and vetted to ensure the best learning experience.",
  },
  {
    icon: <Heart className="h-5 w-5" />,
    title: "Student Focused",
    desc: "Everything we build is designed with the student's success in mind.",
  },
  {
    icon: <Shield className="h-5 w-5" />,
    title: "Trust & Safety",
    desc: "A safe and transparent platform for both students and tutors.",
  },
  {
    icon: <Star className="h-5 w-5" />,
    title: "Excellence",
    desc: "We hold ourselves and our tutors to the highest standards.",
  },
]

export default function AboutUsPage() {
  return (
    <div className="min-h-screen relative">
      {/* Decorative Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-indigo-500/10 rounded-full blur-[120px] -z-10 animate-pulse" />
      <div className="absolute bottom-[20%] right-[-5%] w-[30%] h-[30%] bg-violet-500/10 rounded-full blur-[100px] -z-10" />

      {/* Hero */}
      <section className="py-20 md:py-32 px-6 text-center space-y-8 relative overflow-hidden mt-6">
        <div className="container mx-auto">
          <Badge variant="secondary" className="text-[10px] uppercase tracking-wider font-bold h-6 bg-indigo-500/20 text-indigo-300 border-indigo-500/30">Our Story</Badge>
          <h1 className="text-3xl md:text-6xl font-extrabold tracking-tight max-w-2xl mx-auto leading-tight mt-4 px-2">
            <span className="bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">
              We believe great learning starts with the
            </span>
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
              right tutor
            </span>
          </h1>
          <p className="text-slate-400 max-w-xl mx-auto text-base md:text-lg leading-relaxed mt-6 px-4">
            TutorSpace was built to close the gap between students who want to learn
            and expert tutors who want to teach — making quality education accessible
            to everyone, everywhere.
          </p>
        </div>
      </section>

      {/* Mission cards */}
      <section className="py-16 md:py-20 bg-white/[0.02] border-y border-white/5">
        <div className="container mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <BookOpen className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold">Our Mission</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                To make personalized learning accessible and affordable for every student.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Users className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold">Our Community</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                A growing network of verified tutors and motivated students from all backgrounds.
              </p>
            </div>
            <div className="p-8 rounded-3xl bg-white/5 border border-white/10 backdrop-blur-md hover:bg-white/10 transition-all text-center space-y-4">
              <div className="flex justify-center">
                <div className="p-4 rounded-2xl bg-indigo-500/20 text-indigo-400 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <Star className="h-6 w-6" />
                </div>
              </div>
              <h3 className="text-xl font-bold">Our Vision</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                A world where anyone can learn anything from the best minds around them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="py-24">
        <div className="container mx-auto px-4 space-y-16">
          <div className="text-center space-y-4">
            <h2 className="text-3xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">What we stand for</h2>
            <p className="text-slate-400 max-w-sm mx-auto">
              The principles that guide everything we do.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {values.map(({ icon, title, desc }) => (
              <Card key={title} className="border-white/5 bg-white/[0.02] backdrop-blur-xl group hover:bg-white/5 transition-colors overflow-hidden rounded-2xl">
                <CardContent className="p-6 flex gap-5">
                  <div className="p-3 rounded-xl bg-indigo-500/20 text-indigo-400 h-fit group-hover:scale-110 transition-transform shadow-[0_0_10px_rgba(99,102,241,0.1)]">{icon}</div>
                  <div className="space-y-1">
                    <h3 className="font-bold text-white transition-colors">{title}</h3>
                    <p className="text-sm text-slate-400 leading-relaxed">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 md:py-32 relative overflow-hidden bg-white/[0.01]">
        <div className="container mx-auto px-6 text-center space-y-8">
          <h2 className="text-3xl md:text-4xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/40">Join TutorSpace today</h2>
          <p className="text-slate-400 max-w-sm mx-auto text-base md:text-lg leading-relaxed px-4">
            Whether you want to learn or teach, there is a place for you here.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="rounded-full px-10 bg-indigo-600 hover:bg-indigo-700 shadow-xl transition-all h-12">
              <Link href="/register">Get Started</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="rounded-full px-10 border-white/10 bg-white/5 hover:bg-white/10 backdrop-blur-md h-12">
              <Link href="/tutors" className="flex items-center gap-2">
                Browse Tutors <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </section>

    </div>
  )
}