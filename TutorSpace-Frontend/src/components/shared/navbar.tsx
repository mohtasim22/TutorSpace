"use client";

import Link from "next/link";
import { Menu, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useState, useEffect } from "react";
import { authClient } from "@/lib/auth-client";
import { useRouter, usePathname } from "next/navigation";
import { cn } from "@/lib/utils";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const { data: sessionData } = authClient.useSession();
  const user = sessionData?.user || null;

  const navLinks = [
    { name: "Home", href: "/" },
    { name: "Course Slots", href: "/course-slots" },
    { name: "Tutors", href: "/tutors" },
    { name: "About Us", href: "/about-us" },
  ];

  const handleLogOut = async () => {
    await authClient.signOut();
    router.push("/");
    setOpen(false);
  };

  return (
    <nav
      className={cn(
        "fixed top-0 w-full z-50 transition-all duration-300 py-4",
        scrolled ? "bg-slate-950/40 backdrop-blur-xl shadow-xl py-3" : "bg-transparent py-5"
      )}
    >
      <div className="container mx-auto flex h-16 items-center justify-between px-6">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-xl group transition-all">
          <div className="p-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shadow-[0_0_15px_rgba(99,102,241,0.4)]">
            <BookOpen className="h-5 w-5 text-indigo-400" />
          </div>
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-white transition-all">
            TutorSpace
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.name}
              href={link.href}
              className={cn(
                "px-3 py-1.5 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:text-white",
                pathname === link.href
                  ? "bg-indigo-500/20 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                  : "text-slate-400"
              )}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-2">
          {user ? (
            <>
              <Link href="/dashboard">
                <Button variant="outline" size="sm">Dashboard</Button>
              </Link>
              <Button size="sm" onClick={handleLogOut}>
                Logout
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="ghost" size="lg">Login</Button>
              </Link>
              <Link href="/register">
                <Button size="lg">Register</Button>
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="md:hidden flex items-center gap-2">
          <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger asChild>
              <Button size="icon" variant="outline" aria-label="Open menu">
                <Menu className="h-5 w-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-slate-950/95 backdrop-blur-xl border-white/5 sm:max-w-xs">
              <div className="flex flex-col h-full p-6">

                <SheetHeader className="text-left p-0 mb-6">
                  <SheetTitle asChild>
                    {/* Mobile Logo */}
                    <Link 
                      href="/" 
                      onClick={() => setOpen(false)}
                      className="flex items-center gap-2 font-bold text-lg pb-6 border-b border-white/10 group transition-all"
                    >
                      <div className="p-1 rounded-md bg-indigo-500/10 border border-indigo-500/20 group-hover:bg-indigo-500/20 transition-colors shadow-[0_0_10px_rgba(99,102,241,0.2)]">
                        <BookOpen className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
                      </div>
                      <span className="bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-white transition-all">
                        TutorSpace
                      </span>
                    </Link>
                  </SheetTitle>
                  <SheetDescription className="sr-only">
                    Navigation menu for TutorSpace platform.
                  </SheetDescription>
                </SheetHeader>

                {/* Mobile Nav Links */}
                <nav className="flex flex-col gap-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setOpen(false)}
                      className={cn(
                        "px-3 py-2 rounded-md text-sm font-medium transition-all duration-200 hover:bg-white/10 hover:text-white",
                        pathname === link.href
                          ? "bg-indigo-500/20 text-indigo-200 shadow-[0_0_10px_rgba(99,102,241,0.2)]"
                          : "text-slate-400"
                      )}
                    >
                      {link.name}
                    </Link>
                  ))}
                </nav>

                {/* Mobile Auth Buttons */}
                <div className="mt-auto border-t border-white/10 pt-6 flex flex-col gap-3">
                  {user ? (
                    <>
                      <Link href="/dashboard" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full">
                          Dashboard
                        </Button>
                      </Link>
                      <Button className="w-full" onClick={handleLogOut}>
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link href="/login" onClick={() => setOpen(false)}>
                        <Button variant="outline" className="w-full">Login</Button>
                      </Link>
                      <Link href="/register" onClick={() => setOpen(false)}>
                        <Button className="w-full">Register</Button>
                      </Link>
                    </>
                  )}
                </div>

              </div>
            </SheetContent>
          </Sheet>
        </div>

      </div>
    </nav>
  );
}