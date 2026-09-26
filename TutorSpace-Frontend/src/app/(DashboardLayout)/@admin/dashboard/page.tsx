// @admin/dashboard/page.tsx
import { getAdminStats } from "@/services/admin"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Users, BookOpen, Star, ArrowRight, CalendarCheck } from "lucide-react"
import Link from "next/link"

export default async function AdminDashboardPage() {
  const { stats } = await getAdminStats()

  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Overview of the platform activity.
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Users</span>
            </div>
            <div className="text-2xl font-bold">{stats?.totalUsers ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <CalendarCheck className="h-4 w-4" />
              <span className="text-xs">Total Bookings</span>
            </div>
            <div className="text-2xl font-bold">{stats?.totalBookings ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <BookOpen className="h-4 w-4" />
              <span className="text-xs">Total Courses</span>
            </div>
            <div className="text-2xl font-bold">{stats?.totalCourses ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Star className="h-4 w-4" />
              <span className="text-xs">Total Reviews</span>
            </div>
            <div className="text-2xl font-bold">{stats?.totalReviews ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Links */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Manage</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { href: "/dashboard/users", label: "Manage Users", icon: <Users className="h-4 w-4 mr-2" /> },
            { href: "/dashboard/bookings", label: "Manage Bookings", icon: <CalendarCheck className="h-4 w-4 mr-2" /> },
            { href: "/dashboard/courses", label: "Manage Courses", icon: <BookOpen className="h-4 w-4 mr-2" /> },
            { href: "/dashboard/reviews", label: "Manage Reviews", icon: <Star className="h-4 w-4 mr-2" /> },
          ].map(({ href, label, icon }) => (
            <Button key={href} asChild variant="outline" className="justify-between">
              <Link href={href}>
                <span className="flex items-center">{icon}{label}</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          ))}
        </CardContent>
      </Card>
    </div>
  )
}