
import Link from "next/link"
import { BookOpen } from "lucide-react"
import { Separator } from "@/components/ui/separator"

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-black/20 backdrop-blur-md">
      <div className="max-w-5xl mx-auto px-4 py-12 space-y-10">

        {/* Top */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 text-center md:text-left">

          {/* Brand */}
          <div className="space-y-4 md:col-span-2 flex flex-col items-center md:items-start">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl group transition-all w-fit">
              <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 shadow-[0_0_15px_rgba(99,102,241,0.2)] group-hover:bg-indigo-500/20 transition-colors">
                <BookOpen className="h-5 w-5 text-indigo-400 group-hover:scale-110 transition-transform" />
              </div>
              <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-white transition-all">
                TutorSpace
              </span>
            </Link>
            <p className="text-sm text-muted-foreground max-w-xs">
              Connect with verified tutors and book one-on-one learning sessions at your own pace.
            </p>
          </div>

          {/* Explore */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Explore</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/tutors" className="hover:text-foreground transition">
                  Tutors
                </Link>
              </li>
              <li>
                <Link href="/course-slots" className="hover:text-foreground transition">
                  Course Slots
                </Link>
              </li>
              <li>
                <Link href="/about-us" className="hover:text-foreground transition">
                  About Us
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div className="space-y-3">
            <h4 className="text-sm font-semibold">Account</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/login" className="hover:text-foreground transition">
                  Login
                </Link>
              </li>
              <li>
                <Link href="/register" className="hover:text-foreground transition">
                  Register
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="hover:text-foreground transition">
                  Dashboard
                </Link>
              </li>
            </ul>
          </div>

        </div>

        <Separator />

        {/* Bottom */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-4 md:gap-2 text-xs text-muted-foreground text-center">
          <p>© {new Date().getFullYear()} TutorSpace. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-foreground transition">Privacy Policy</Link>
            <Link href="#" className="hover:text-foreground transition">Terms of Service</Link>
          </div>
        </div>

      </div>
    </footer>
  )
}