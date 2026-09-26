
"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { BookOpen } from "lucide-react"
import Link from "next/link"
import { createTutorProfile } from "@/services/tutor"

const schema = z.object({
  display_name: z.string().min(2, "Display name must be at least 2 characters"),
  bio: z.string().min(10, "Bio must be at least 10 characters"),
  qualification: z.string().min(2, "Qualification is required"),
})

type FormValues = z.infer<typeof schema>

export default function TutorProfileSetupForm() {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()
  const email = searchParams.get("email")

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      display_name: "",
      bio: "",
      qualification: "",
    },
  })

  const onSubmit = async (values: FormValues) => {
    try {
      setLoading(true)
      // No email is sent: the API derives the account from the session.
      const res = await createTutorProfile(values)

      if (res?.status === "success") {
        toast.success("Profile created! Please log in.")
        router.push("/login")
      } else {
        toast.error(res?.message || "Failed to create profile")
      }
    } catch {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 group transition-all">
          <BookOpen className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-white transition-all">
            TutorSpace
          </span>
        </Link>

        <Card>
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">Set up your tutor profile</CardTitle>
            <p className="text-sm text-muted-foreground">
              Tell students about yourself before you start teaching
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="display_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Display Name</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. John Doe" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="qualification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Qualification</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="e.g. PhD in Computer Science" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bio"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Bio</FormLabel>
                      <FormControl>
                        <Textarea
                          {...field}
                          rows={4}
                          placeholder="Tell students about your teaching experience..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" className="w-full" disabled={loading}>
                  {loading ? "Creating profile..." : "Complete Setup"}
                </Button>

              </form>
            </Form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}