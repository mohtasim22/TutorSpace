
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
import { Search, Users } from "lucide-react"
import { updateUserStatus } from "@/services/admin"
import {
  TableView,
  CardView,
  MobileCard,
  Field,
  CardActions,
} from "@/components/shared/responsiveTable"

type User = {
  id: string
  name: string
  email: string
  role: string
  status: string
  createdAt: string
}

export default function AdminUsersPage({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState<string | null>(null)

  const filtered = users.filter((u) =>
    u.name.toLowerCase().includes(query.toLowerCase()) ||
    u.email.toLowerCase().includes(query.toLowerCase()) ||
    u.role.toLowerCase().includes(query.toLowerCase())
  )

  const handleStatusToggle = async (userId: string, currentStatus: string) => {
    const newStatus = currentStatus === "ACTIVE" ? "BANNED" : "ACTIVE"
    try {
      setLoading(userId)
      const res = await updateUserStatus(userId, newStatus)
      if (res?.status === "success") {
        setUsers((prev) =>
          prev.map((u) => u.id === userId ? { ...u, status: newStatus } : u)
        )
        toast.success(`User ${newStatus === "ACTIVE" ? "activated" : "banned"}`)
      } else {
        toast.error(res?.message || "Failed to update status")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(null)
    }
  }

  // Shared by the table and the mobile cards below, so the controls exist
  // once rather than in two copies that can drift apart.
  const renderActions = (user: any) => (
    <>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={loading === user.id}
                          className={user.status === "ACTIVE"
                            ? "text-red-600 border-red-600 hover:bg-red-50"
                            : "text-green-600 border-green-600 hover:bg-green-50"
                          }
                        >
                          {user.status === "ACTIVE" ? "Ban" : "Activate"}
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            {user.status === "ACTIVE" ? "Ban" : "Activate"} User
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            {`Are you sure you want to ${user.status === "ACTIVE" ? "Ban" : "activate"} ${user.name}?`}
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancel</AlertDialogCancel>
                          <AlertDialogAction
                            onClick={() => handleStatusToggle(user.id, user.status)}
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
        <h1 className="text-xl sm:text-2xl font-bold">Manage Users</h1>
        <Badge variant="outline">{users.length} total</Badge>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search by name, email or role..."
          className="pl-9"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Users className="h-4 w-4" />
            All Users
          </CardTitle>
        </CardHeader>
        <CardContent>
          <TableView>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    No users match this filter.
                  </TableCell>
                </TableRow>
              )}
              {filtered.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div className="font-medium text-sm">{user.name}</div>
                    <div className="text-xs text-muted-foreground">{user.email}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{user.role}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                      {user.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                    {new Date(user.createdAt).toLocaleDateString(undefined, {
                      month: "short", day: "numeric", year: "numeric"
                    })}
                  </TableCell>
                  <TableCell>{renderActions(user)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </TableView>

          {/* Phones: one card per row. These tables are five and six
              columns wide, so on a narrow screen the controls in the
              last column can only be reached by swiping. */}
          <CardView>
            {filtered.map((user: any) => (
              <MobileCard key={user.id}>
                <div className="min-w-0">
                  <div className="font-medium text-sm truncate">{user.name}</div>
                  <div className="text-xs text-muted-foreground break-all">{user.email}</div>
                </div>
                <Field label="Role"><Badge variant="outline">{user.role}</Badge></Field>
                <Field label="Status">
                  <Badge variant={user.status === "ACTIVE" ? "default" : "secondary"}>
                    {user.status}
                  </Badge>
                </Field>
                <Field label="Joined">
                  {new Date(user.createdAt).toLocaleDateString(undefined, {
                    month: "short", day: "numeric", year: "numeric"
                  })}
                </Field>
                <CardActions>{renderActions(user)}</CardActions>
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