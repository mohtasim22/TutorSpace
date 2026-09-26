
"use client"

import { useState } from "react"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Table, TableBody, TableCell,
  TableHead, TableHeader, TableRow,
} from "@/components/ui/table"
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription,
  AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Search, ShieldCheck, ShieldX, Star, Users } from "lucide-react"
import { verifyTutor } from "@/services/admin"
import {
  TableView,
  CardView,
  MobileCard,
  Field,
  CardActions,
} from "@/components/shared/responsiveTable"

type Tutor = {
  id: string
  display_name: string
  bio: string
  qualification: string
  rating_avg: number
  total_reviews: number
  is_verified: boolean
  createdAt: string
  user: {
    name: string
    email: string
    status: string
  }
}

export default function AdminTutorsPage({ initialTutors }: { initialTutors: Tutor[] }) {
  const [tutors, setTutors] = useState<Tutor[]>(initialTutors)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = tutors.filter((t) => {
    const q = query.toLowerCase()
    return (
      t.display_name.toLowerCase().includes(q) ||
      t.user?.email.toLowerCase().includes(q) ||
      t.qualification.toLowerCase().includes(q)
    )
  })

  const handleVerify = async (tutorId: string, current: boolean) => {
    try {
      setLoading(tutorId)
      const res = await verifyTutor(tutorId, !current)

      if (res?.status === "success") {
        setTutors((prev) =>
          prev.map((t) =>
            t.id === tutorId ? { ...t, is_verified: !current } : t
          )
        )
        toast.success(
          !current ? "Tutor verified successfully!" : "Tutor unverified"
        )
      } else {
        toast.error(res?.message || "Failed to update verification")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  const verified = tutors.filter((t) => t.is_verified).length
  const unverified = tutors.filter((t) => !t.is_verified).length

  // Shared by the table and the mobile cards below, so the controls exist
  // once rather than in two copies that can drift apart.
  const renderActions = (tutor: any) => (
    <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading === tutor.id}
                          className={tutor.is_verified
                            ? "text-red-600 border-red-600 hover:bg-red-50"
                            : "text-green-600 border-green-600 hover:bg-green-50"
                          }
                        >
                          {tutor.is_verified ? (
                            <>
                              <ShieldX className="h-4 w-4 mr-1" />
                              Unverify
                            </>
                          ) : (
                            <>
                              <ShieldCheck className="h-4 w-4 mr-1" />
                              Verify
                            </>
                          )}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {tutor.is_verified ? "Unverify" : "Verify"} Tutor
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {`Are you sure you want to ${tutor.is_verified ? "remove verification from" : "verify"} ${tutor.display_name}?`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleVerify(tutor.id, tutor.is_verified)}
                          >
                            Confirm
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </>
  )

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-0 sm:px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">Tutor Verification</h1>
        <Badge variant="outline">{tutors.length} total</Badge>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Users className="h-4 w-4" />
              <span className="text-xs">Total Tutors</span>
            </div>
            <div className="text-2xl font-bold">{tutors.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldCheck className="h-4 w-4 text-green-500" />
              <span className="text-xs">Verified</span>
            </div>
            <div className="text-2xl font-bold text-green-600">{verified}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6 space-y-1">
            <div className="flex items-center gap-2 text-muted-foreground">
              <ShieldX className="h-4 w-4 text-yellow-500" />
              <span className="text-xs">Pending</span>
            </div>
            <div className="text-2xl font-bold text-yellow-600">{unverified}</div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or qualification..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" />
            All Tutors
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableView>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tutor</TableHead>
                <TableHead>Qualification</TableHead>
                <TableHead>Rating</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>Verified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((tutor) => (
                <TableRow key={tutor.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{tutor.display_name}</div>
                    <div className="text-xs text-muted-foreground">
                      {tutor.user?.email}
                    </div>
                    
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs uppercase">
                      {tutor.qualification}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                      <span>{tutor.rating_avg}</span>
                      <span className="text-muted-foreground text-xs">
                        ({tutor.total_reviews})
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={tutor.user?.status === "ACTIVE" ? "default" : "secondary"}
                    >
                      {tutor.user?.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {tutor.is_verified ? (
                      <div className="flex items-center gap-1 text-green-600 text-sm">
                        <ShieldCheck className="h-4 w-4" />
                        Verified
                      </div>
                    ) : (
                      <div className="flex items-center gap-1 text-yellow-600 text-sm">
                        <ShieldX className="h-4 w-4" />
                        Pending
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{renderActions(tutor)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableView>

          {/* Phones: one card per row. These tables are five and six
              columns wide, so on a narrow screen the controls in the
              last column can only be reached by swiping. */}
          <CardView>
            {filtered.map((tutor: any) => (
              <MobileCard key={tutor.id}>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{tutor.display_name}</div>
                  <div className="text-xs text-muted-foreground break-all">
                    {tutor.user?.email}
                  </div>
                </div>
                <Field label="Qualification">
                  <Badge variant="outline" className="text-xs uppercase">
                    {tutor.qualification}
                  </Badge>
                </Field>
                <Field label="Rating">
                  <span className="inline-flex items-center gap-1">
                    <Star className="h-3.5 w-3.5 text-yellow-400 fill-yellow-400" />
                    {tutor.rating_avg}
                    <span className="text-muted-foreground text-xs">
                      ({tutor.total_reviews})
                    </span>
                  </span>
                </Field>
                <Field label="Account">
                  <Badge variant={tutor.user?.status === "ACTIVE" ? "default" : "secondary"}>
                    {tutor.user?.status}
                  </Badge>
                </Field>
                <Field label="Verified">
                  {tutor.is_verified ? (
                    <span className="inline-flex items-center gap-1 text-green-600">
                      <ShieldCheck className="h-4 w-4" />
                      Verified
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-yellow-600">
                      <ShieldX className="h-4 w-4" />
                      Pending
                    </span>
                  )}
                </Field>
                <CardActions>{renderActions(tutor)}</CardActions>
              </MobileCard>
            ))}
            {filtered.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nothing to show.
              </p>
            )}
          </CardView>
        </CardContent>
      </Card>
    </div>
  )
}