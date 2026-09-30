"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Calendar, Clock, Plus, Pencil, Trash2, Link2 } from "lucide-react"
import { createSlot, updateSlot, deleteSlot } from "@/services/courseSlots"
import {
  TableView,
  CardView,
  MobileCard,
  Field,
  CardActions,
} from "@/components/shared/responsiveTable"

type Course = {
  id: string
  name: string
}

type Slot = {
  id: string
  name: string
  description: string
  start_time: string
  end_time: string
  date: string
  course_id: string
  /** Set by the server from capacity: 1 seat = one-to-one, more = group. */
  session_type: "ONE_ON_ONE" | "GROUP"
  capacity: number
  course: { name: string }
}

type SlotFormValues = {
  name: string
  description: string
  date: string
  start_time: string
  end_time: string
  course_id: string
  capacity: number
}

interface Props {
  initialSlots: Slot[]
  courses: Course[]
}

/** Where a slot is in time. Anything but "upcoming" is locked for editing. */
const slotStatus = (slot: Pick<Slot, "start_time" | "end_time">) => {
  const now = Date.now()
  if (new Date(slot.start_time).getTime() > now) return "upcoming" as const
  if (new Date(slot.end_time).getTime() > now) return "in-progress" as const
  return "ended" as const
}

function StatusBadge({ slot }: { slot: Slot }) {
  const status = slotStatus(slot)
  if (status === "upcoming") return null
  return status === "in-progress" ? (
    <Badge className="text-[10px]">In progress</Badge>
  ) : (
    <Badge variant="secondary" className="text-[10px]">Ended</Badge>
  )
}

export default function TutorSlotsPage({ initialSlots, courses }: Props) {
  const [slots, setSlots] = useState<Slot[]>(initialSlots)
  const [openCreate, setOpenCreate] = useState(false)
  const [editSlot, setEditSlot] = useState<Slot | null>(null)
  const [loading, setLoading] = useState(false)

  const createForm = useForm<SlotFormValues>({
    defaultValues: {
      name: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      course_id: "",
      capacity: 1,
    },
  })

  const editForm = useForm<SlotFormValues>({
    defaultValues: {
      name: "",
      description: "",
      date: "",
      start_time: "",
      end_time: "",
      course_id: "",
      capacity: 1,
    },
  })

  const toTimeString = (iso: string) => {
    const d = new Date(iso)
    return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`
  }

  const toDateString = (iso: string) => {
    const d = new Date(iso)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`
  }

  // Capacity is the only choice the tutor makes: the server derives the session
  // type from it (1 seat = one-to-one, more = group). Coerce it to a whole
  // number, since a number input still hands back a string.
  const normalizeSlot = (values: SlotFormValues) => ({
    ...values,
    capacity: Math.max(1, Math.floor(Number(values.capacity)) || 1),
  })

  const handleCreate = async (values: SlotFormValues) => {
    try {
      setLoading(true)
      const res = await createSlot(normalizeSlot(values))

      if (res?.status === "success") {
        setSlots((prev) => [...prev, res.slot])
        setOpenCreate(false)
        createForm.reset()
        toast.success("Slot created successfully")
      } else {
        toast.error(res?.message || "Failed to create slot")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = async (values: SlotFormValues) => {
    if (!editSlot) return
    try {
      setLoading(true)
      const res = await updateSlot(editSlot.id, normalizeSlot(values))

      if (res?.status === "success") {
        setSlots((prev) =>
          prev.map((s) => (s.id === editSlot.id ? res.slot : s)) // ✅ use res.slot
        )
        setEditSlot(null)
        toast.success("Slot updated successfully")
      } else {
        toast.error(res?.message || "Failed to update slot")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (slotId: string) => {
    try {
      setLoading(true)
      const res = await deleteSlot(slotId)

      if (res?.status === "success") {
        setSlots((prev) => prev.filter((s) => s.id !== slotId))
        toast.success("Slot deleted successfully")
      } else {
        toast.error(res?.message || "Failed to delete slot")
      }
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }
  const openEditDialog = (slot: Slot) => {
    setEditSlot(slot)
    editForm.reset({
      name: slot.name,
      description: slot.description,
      date: toDateString(slot.date),
      start_time: toTimeString(slot.start_time),
      end_time: toTimeString(slot.end_time),
      course_id: slot.course_id,
      capacity: slot.capacity ?? 1,
    })
  }

  const SlotForm = ({
    form,
    onSubmit,
    submitLabel,
  }: {
    form: any
    onSubmit: (values: SlotFormValues) => void
    submitLabel: string
  }) => (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {/* Course */}
        <FormField
          control={form.control}
          name="course_id"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Course</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select a course" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {courses.map((course) => (
                    <SelectItem key={course.id} value={course.id}>
                      {course.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Name */}
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slot Name</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} placeholder="e.g. CSE110 Slot 1" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea {...field} value={field.value ?? ""} rows={2} placeholder="Slot description" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Capacity — the session type follows from it */}
        <FormField
          control={form.control}
          name="capacity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Capacity (students)</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  value={field.value ?? 1}
                  type="number"
                  min={1}
                  step={1}
                  placeholder="e.g. 1"
                />
              </FormControl>
              <p className="text-xs text-muted-foreground">
                {Number(form.watch("capacity")) > 1
                  ? "Group session: several students join the same class."
                  : "One-to-one session: one student only."}
              </p>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Date */}
        <FormField
          control={form.control}
          name="date"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Date</FormLabel>
              <FormControl>
                <Input {...field} value={field.value ?? ""} type="date" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Start & End Time */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="start_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start Time</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="time" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end_time"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End Time</FormLabel>
                <FormControl>
                  <Input {...field} value={field.value ?? ""} type="time" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <Button type="submit" className="w-full" disabled={loading}>
          {loading ? "Saving..." : submitLabel}
        </Button>
      </form>
    </Form>
  )

  // Shared by the table and the mobile cards. One definition, so the Edit
  // dialog stays bound to a single `editSlot` state rather than two copies.
  //
  // Once a class has started, Edit and Delete are dimmed: it is now a record
  // of a lesson, not a plan. The server enforces the same rule, so this only
  // saves the tutor a refused request. The wrapping <span> carries the
  // explanation because a disabled button does not show a tooltip.
  const renderActions = (slot: Slot) => {
    const locked = slotStatus(slot) !== "upcoming"
    const lockReason = "This class has already started, so it can't be changed."
    return (
                      <div className="flex items-center gap-2">
                        {/* Edit */}
                        <Dialog
                          open={editSlot?.id === slot.id}
                          onOpenChange={(open) => !open && setEditSlot(null)}
                        >
                          <span title={locked ? lockReason : undefined}>
                          <DialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              disabled={locked}
                              onClick={() => openEditDialog(slot)}
                            >
                              <Pencil className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                          </DialogTrigger>
                          </span>
                          <DialogContent className="max-w-lg">
                            <DialogHeader>
                              <DialogTitle>Edit Slot</DialogTitle>
                              <DialogDescription>
                                Update the details of your tutoring slot.
                              </DialogDescription>
                            </DialogHeader>
                            <SlotForm
                              form={editForm}
                              onSubmit={handleEdit}
                              submitLabel="Save Changes"
                            />
                          </DialogContent>
                        </Dialog>

                        {/* Delete */}
                        <AlertDialog>
                          <span title={locked ? lockReason : undefined}>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-red-600 border-red-600 hover:bg-red-50"
                              disabled={loading || locked}
                            >
                              <Trash2 className="h-4 w-4 mr-1" />
                              Delete
                            </Button>
                          </AlertDialogTrigger>
                          </span>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Slot</AlertDialogTitle>
                              <AlertDialogDescription>
                                {`Are you sure you want to delete "${slot.name}"? This action cannot be undone.`}
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                onClick={() => handleDelete(slot.id)}
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto py-6 sm:py-10 px-0 sm:px-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-xl sm:text-2xl font-bold">My Slots</h1>
        <Dialog open={openCreate} onOpenChange={setOpenCreate}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Slot
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Create New Slot</DialogTitle>
              <DialogDescription>
                Fill in the details to create a new tutoring slot for your course.
              </DialogDescription>
            </DialogHeader>
            <SlotForm form={createForm} onSubmit={handleCreate} submitLabel="Create Slot" />
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">All Slots</CardTitle>
        </CardHeader>
        <CardContent>
          {slots.length === 0 ? (
            <div className="text-center py-10 text-muted-foreground">
              No slots yet. Create your first slot.
            </div>
          ) : (
            <>
            <TableView>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Slot</TableHead>
                  <TableHead>Course</TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      Date
                    </div>
                  </TableHead>
                  <TableHead>
                    <div className="flex items-center gap-1">
                      <Clock className="h-4 w-4" />
                      Time
                    </div>
                  </TableHead>
                  <TableHead>Class</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {slots.map((slot) => (
                  <TableRow key={slot.id}>
                    <TableCell>
                      <div className="font-medium flex items-center gap-2">
                        {slot.name}
                        <StatusBadge slot={slot} />
                      </div>
                      <div className="text-xs text-muted-foreground">{slot.description}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {slot.course?.name ?? slot.course_id}
                      </Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(slot.date).toLocaleDateString(undefined, {
                        year: "numeric",
                        month: "short",
                        day: "numeric",
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap text-sm text-muted-foreground">
                      {new Date(slot.start_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                      {" — "}
                      {new Date(slot.end_time).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      <Button
                        size="sm"
                        asChild
                        className="relative group overflow-hidden bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)] hover:shadow-[0_0_25px_rgba(99,102,241,0.4)] transition-all duration-300 gap-2 h-8 px-4"
                      >
                        <a href={`/dashboard/call/${slot.id}`}>
                          <Link2 className="h-4 w-4 shrink-0 transition-transform group-hover:scale-110" />
                          <span className="relative z-10 whitespace-nowrap">Join Meeting</span>
                        </a>
                      </Button>
                    </TableCell>
                    <TableCell>{renderActions(slot)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
            </TableView>

            {/* Phones: one card per slot. Seven columns is the widest table in
                the app, and Edit/Delete sat at the far right of it. */}
            <CardView>
              {slots.map((slot) => (
                <MobileCard key={slot.id}>
                  <div className="min-w-0">
                    <div className="font-medium truncate">{slot.name}</div>
                    <div className="text-xs text-muted-foreground line-clamp-2">
                      {slot.description}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1">
                    <Badge variant="outline">
                      {slot.course?.name ?? slot.course_id}
                    </Badge>
                    <StatusBadge slot={slot} />
                  </div>

                  <Field label="Date">
                    {new Date(slot.date).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </Field>
                  <Field label="Time">
                    {new Date(slot.start_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {" — "}
                    {new Date(slot.end_time).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </Field>

                  <Button
                    size="sm"
                    asChild
                    variant="outline"
                    className="w-full gap-2"
                  >
                    <a href={`/dashboard/call/${slot.id}`}>
                      <Link2 className="h-4 w-4 shrink-0" />
                      Join Meeting
                    </a>
                  </Button>

                  <CardActions>{renderActions(slot)}</CardActions>
                </MobileCard>
              ))}
            </CardView>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}