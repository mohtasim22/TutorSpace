"use client"
import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { toast } from "sonner"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { BookOpen, ArrowLeft, Send } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const formSchema = z.object({
  email: z.string().email("Please enter a valid email address."),
})

type FormValues = z.infer<typeof formSchema>

export function ForgotPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [isSent, setIsSent] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { email: "" },
  })

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true)
      setServerError(null)
      
      const { error } = await authClient.requestPasswordReset({
        email: data.email,
        redirectTo: window.location.origin + "/reset-password",
      })

      if (!error) {
        setIsSent(true)
        toast.success("Reset link sent! Please check your email.")
      } else {
        setServerError(error.message || "Failed to send reset link. Please try again.")
      }
    } catch (error: any) {
      setServerError(error.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center space-y-6"
        >
          <div className="flex justify-center flex-col items-center gap-4">
             <div className="h-20 w-20 rounded-full bg-indigo-500/10 flex items-center justify-center">
                <Send className="h-10 w-10 text-indigo-400 animate-bounce" />
             </div>
             <h2 className="text-2xl font-bold">Check your inbox</h2>
             <p className="text-muted-foreground">
                We've sent a password reset link to <span className="text-indigo-400 font-medium">{form.getValues("email")}</span>. 
                Please check your email and follow the instructions.
             </p>
          </div>
          <Button variant="outline" className="w-full" asChild>
             <Link href="/login">Back to Login</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
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
            <CardTitle className="text-2xl">Forgot Password?</CardTitle>
            <p className="text-sm text-muted-foreground">
              Enter your email to receive a password reset link
            </p>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email Address</FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          type="email"
                          placeholder="john@example.com"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <AnimatePresence>
                  {serverError && (
                    <motion.div
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -10 }}
                      className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-xs text-center backdrop-blur-md"
                    >
                      {serverError}
                    </motion.div>
                  )}
                </AnimatePresence>

                <Button type="submit" className="w-full h-11" disabled={loading}>
                  {loading ? "Sending Link..." : "Send Reset Link"}
                </Button>

                <div className="pt-2 text-center">
                    <Button variant="link" className="text-slate-400 no-underline hover:text-white" asChild>
                        <Link href="/login" className="flex items-center gap-2">
                           <ArrowLeft className="h-4 w-4" />
                           Back to Login
                        </Link>
                    </Button>
                </div>

              </form>
            </Form>
          </CardContent>
        </Card>

      </div>
    </div>
  )
}
