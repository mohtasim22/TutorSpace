"use client"

import * as React from "react"
import { BookOpen, LogOut, SquareTerminal } from "lucide-react"
import Link from "next/link"
import { NavMain } from "@/components/nav-main"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { authClient } from "@/lib/auth-client"
import { useRouter } from "next/navigation"

const ADMIN_navMain = [
  {
    title: "ADMIN DASHBOARD",
    url: "/dashboard",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "Manage Users", url: "/dashboard/users" },
      { title: "Manage Tutors", url: "/dashboard/tutors" },     
      { title: "Manage Courses", url: "/dashboard/courses" },
      { title: "Manage Bookings", url: "/dashboard/bookings" },
      { title: "Manage Reviews", url: "/dashboard/reviews" },
      { title: "Home", url: "/" },
    ],
  },
]

const TUTOR_navMain = [
  {
    title: "TUTOR DASHBOARD",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "My Courses", url: "/dashboard/courses" },
      { title: "Create/Edit Slots", url: "/dashboard/slots" },
      { title: "Earnings", url: "/dashboard/earnings" },
      { title: "Calendar", url: "/dashboard/calendar" },
      { title: "Assignments", url: "/dashboard/assignments" },
      { title: "Course Materials", url: "/dashboard/materials" },
      { title: "Practice Questions", url: "/dashboard/practice" },
      { title: "Announcements", url: "/dashboard/announcements" },
      { title: "Booked Slots", url: "/dashboard/bookings" },
      { title: "Reviews & Ratings", url: "/dashboard/reviews" },
      { title: "Profile Settings", url: "/dashboard/profile" },
      { title: "Home", url: "/" },
    ],
  },
]

const STUDENT_navMain = [
  {
    title: "STUDENT DASHBOARD",
    url: "#",
    icon: SquareTerminal,
    isActive: true,
    items: [
      { title: "Dashboard", url: "/dashboard" },
      { title: "Calendar", url: "/dashboard/calendar" },
      { title: "Assignments", url: "/dashboard/assignments" },
      { title: "Course Materials", url: "/dashboard/materials" },
      { title: "Practice Quizzes", url: "/dashboard/practice" },
      { title: "Announcements", url: "/dashboard/announcements" },
      { title: "Slot Bookings", url: "/dashboard/bookings" },
      { title: "History and Reviews", url: "/dashboard/booking-history" },
      { title: "Profile Settings", url: "/dashboard/profile" },
      { title: "Home", url: "/" },
    ],
  },
]

const roleBadgeVariant: Record<string, "default" | "secondary" | "outline"> = {
  ADMIN: "default",
  TUTOR: "secondary",
  STUDENT: "outline",
}

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  userRole: "ADMIN" | "STUDENT" | "TUTOR"
  userName?: string
}

export function AppSidebar({ userRole, userName, ...props }: AppSidebarProps) {
  const router = useRouter()

  const navItem =
    userRole === "ADMIN"
      ? ADMIN_navMain
      : userRole === "TUTOR"
      ? TUTOR_navMain
      : STUDENT_navMain

  const initials = userName
    ? userName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .slice(0, 2)
        .toUpperCase()
    : userRole.slice(0, 2).toUpperCase()

  const handleLogOut = async () => {
    await authClient.signOut()
    router.push("/")
  }

  return (
    <Sidebar collapsible="icon" {...props}>

      {/* Brand */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href="/" className="flex items-center gap-2 px-1 hover:bg-transparent active:bg-transparent">
                <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground shrink-0 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
                  <BookOpen className="h-4 w-4" />
                </div>
                <span className="font-bold text-base group-data-[collapsible=icon]:hidden bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                  TutorSpace
                </span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent className="font-semibold">
        <NavMain items={navItem} />
      </SidebarContent>

      {/* User info + logout at bottom */}
      <SidebarFooter>
        <div className="flex items-center gap-3 px-2 py-3 border-t">
          <Avatar className="h-8 w-8 shrink-0">
            <AvatarFallback className="text-xs font-bold">
              {initials}
            </AvatarFallback>
          </Avatar>

          {/* hidden when collapsed */}
          <div className="flex flex-1 flex-col gap-1 overflow-hidden group-data-[collapsible=icon]:hidden">
            <span className="text-sm font-semibold truncate">
              {userName ?? "User"}
            </span>
            <Badge
              variant={roleBadgeVariant[userRole]}
              className="text-[10px] w-fit px-1.5 py-0"
            >
              {userRole}
            </Badge>
          </div>

          {/* logout button — shows icon only when collapsed */}
          <Button
            variant="ghost"
            size="icon"
            aria-label="Log out"
            className="shrink-0 text-muted-foreground hover:text-destructive"
            onClick={handleLogOut}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  )
}