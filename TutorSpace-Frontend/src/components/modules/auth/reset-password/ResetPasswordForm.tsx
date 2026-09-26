"use client"
import { useState, Suspense } from "react"
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
import { BookOpen, Eye, EyeOff, CheckCircle2, ChevronLeft } from "lucide-react"
import { authClient } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { motion, AnimatePresence } from "framer-motion"

const formSchema = z.object({
  newPassword: z.string().min(8, "Password must be at least 8 characters long."),
  confirmPassword: z.string().min(1, "Please confirm your password."),
}).refine((data) => data.newPassword === data.confirmPassword, {
  message: "Passwords do not match.",
  path: ["confirmPassword"],
})

type FormValues = z.infer<typeof formSchema>

export function ResetPasswordForm() {
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get("token") || ""

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { newPassword: "", confirmPassword: "" },
  })

  const onSubmit = async (data: FormValues) => {
    if (!token) {
        setServerError("Invalid or missing reset token. Please request a new link.");
        return;
    }

    try {
      setLoading(true)
      setServerError(null)
      
      const { error } = await authClient.resetPassword({
        newPassword: data.newPassword,
        token: token,
      })

      if (!error) {
        setIsSuccess(true)
        toast.success("Password reset successful!")
        setTimeout(() => {
            router.push("/login")
        }, 3000)
      } else {
        setServerError(error.message || "Failed to reset password. The link may be expired.")
      }
    } catch (error: any) {
      setServerError(error.message || "An error occurred. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4">
        <motion.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="w-full max-w-md text-center space-y-6"
        >
          <div className="flex justify-center flex-col items-center gap-4">
             <div className="h-20 w-20 rounded-full bg-green-500/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-green-400" />
             </div>
             <h2 className="text-2xl font-bold">Password Reset Successful</h2>
             <p className="text-muted-foreground">
                Your password has been successfully updated. You will be redirected to the login page shortly.
             </p>
          </div>
          <Button className="w-full" asChild>
             <Link href="/login">Go to Login Now</Link>
          </Button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md space-y-6">

        {/* Logo */}
        <Link href="/" className="flex items-center justify-center gap-2 group transition-all">
          <BookOpen className="h-6 w-6 text-indigo-400 group-hover:scale-110 transition-transform" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70 group-hover:to-white transition-all">
            TutorSpace
          </span>
        </Link>

        {!token ? (
            <Card className="border-red-500/20 bg-red-500/5">
                <CardHeader>
                    <CardTitle className="text-center text-red-200">Invalid Link</CardTitle>
                </CardHeader>
                <CardContent className="text-center space-y-4">
                    <p className="text-sm text-red-300">
                        The password reset token is missing or invalid. Please check the link in your email or request a new one.
                    </p>
                    <Button variant="outline" className="w-full" asChild>
                        <Link href="/forgot-password">Request New Link</Link>
                    </Button>
                </CardContent>
            </Card>
        ) : (
            <Card>
            <CardHeader className="text-center">
                <CardTitle className="text-2xl">Reset Password</CardTitle>
                <p className="text-sm text-muted-foreground">
                Set a strong new password for your account
                </p>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">

                    <FormField
                    control={form.control}
                    name="newPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <div className="relative">
                            <Input
                                {...field}
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                autoComplete="new-password"
                            />
                            <button
                                type="button"
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                            </div>
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                    />

                    <FormField
                    control={form.control}
                    name="confirmPassword"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Confirm New Password</FormLabel>
                        <FormControl>
                            <Input
                            {...field}
                            type={showPassword ? "text" : "password"}
                            placeholder="••••••••"
                            autoComplete="new-password"
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
                    {loading ? "Resetting Password..." : "Update Password"}
                    </Button>
                    
                    <div className="text-center pt-2">
                        <Button variant="ghost" className="text-slate-500 hover:text-white" asChild>
                            <Link href="/login" className="flex items-center gap-2">
                                <ChevronLeft className="h-4 w-4" />
                                Back to Sign In
                            </Link>
                        </Button>
                    </div>

                </form>
                </Form>
            </CardContent>
            </Card>
        )}

      </div>
    </div>
  )
}
