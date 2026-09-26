"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { CheckCircle, Star, Pencil, User } from "lucide-react";
import { toast } from "sonner";
import { updateTutorProfile } from "@/services/tutor";
import { authClient } from "@/lib/auth-client";

type TutorProfile = {
  display_name: string;
  bio: string;
  qualification: string;
  rating_avg: number;
  total_reviews: number;
  is_verified: boolean;
};

type UserInfo = {
  name: string;
  email: string;
  role: string;
  status: string;
};

export default function TutorProfileForm({ user, tutor: tutorData }: { user: any; tutor: any }) {
  const [profile, setProfile] = useState<UserInfo>(user);
  const [openU, setOpenU] = useState(false);

  const form1 = useForm<Pick<UserInfo, "name">>({
    defaultValues: {
      name: profile.name,
    },
  });

  const onSubmit1 = async (values: Pick<UserInfo, "name">) => {
    try {
      const res = await authClient.updateUser({ name: values.name })
      if (res.data) {
        setProfile((prev) => ({ ...prev, ...values }))
        setOpen(false)
        toast.success("Profile updated successfully")
      } else {
        toast.error("Failed to update profile")
      }
    } catch (error) {
      toast.error("Failed to update profile")
    }
  }


  const [tutor, setTutor] = useState<TutorProfile>({
    display_name: tutorData?.display_name ?? "",
    bio: tutorData?.bio ?? "",
    qualification: tutorData?.qualification ?? "",
    rating_avg: tutorData?.rating_avg ?? 0,
    total_reviews: tutorData?.total_reviews ?? 0,
    is_verified: tutorData?.is_verified ?? false,
  });
  const [open, setOpen] = useState(false);

  const form = useForm<Pick<TutorProfile, "display_name" | "bio" | "qualification">>({
    defaultValues: {
      display_name: tutor.display_name,
      bio: tutor.bio,
      qualification: tutor.qualification,
    },
  });

  const onSubmit = async (values: Pick<TutorProfile, "display_name" | "bio" | "qualification">) => {
    try {
      const res = await updateTutorProfile(values);
      if (res?.status === "success") {
        setTutor((prev) => ({ ...prev, ...values }));
        setOpen(false);
        toast.success("Profile updated successfully");
      }
    } catch (error) {
      console.error("Failed to update profile:", error);
      toast.error("Failed to update profile");
    }
  };





  return (
    <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
      <h1 className="text-2xl font-bold">Profile Settings</h1>

      {/* Account Info - from user prop */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Account Info</CardTitle>
          <Dialog open={openU} onOpenChange={setOpenU}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Profile</DialogTitle>
                <DialogDescription>
                  Make changes to your account profile here. Click save when you're done.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form1.handleSubmit(onSubmit1)} className="space-y-4">
                  <FormField
                    control={form1.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>

        <CardContent className="space-y-3 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Username</span>
            <span className="font-medium">{profile.name}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Email</span>
            <span className="font-medium">{profile.email}</span>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Role</span>
            <Badge variant="outline">{profile.role}</Badge>
          </div>
          <Separator />
          <div className="flex justify-between">
            <span className="text-muted-foreground">Status</span>
            <Badge variant={profile.status === "ACTIVE" ? "default" : "secondary"}>
              {profile.status}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tutor Profile - from tutor prop */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base">Tutor Profile</CardTitle>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
              <Button size="sm" variant="outline">
                <Pencil className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Tutor Profile</DialogTitle>
                <DialogDescription>
                  Update your tutor-specific information like bio and qualifications.
                </DialogDescription>
              </DialogHeader>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="display_name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Display Name</FormLabel>
                        <FormControl>
                          <Input {...field} value={field.value ?? ""} />
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
                          <Textarea {...field} value={field.value ?? ""} rows={3} />
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
                          <Input {...field} value={field.value ?? ""} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button type="submit" className="w-full">
                    Save Changes
                  </Button>
                </form>
              </Form>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-center gap-2">
            <User className="h-4 w-4 text-muted-foreground" />
            <span className="font-medium text-base">{tutor.display_name}</span>
            {tutor.is_verified && (
              <CheckCircle className="h-4 w-4 text-green-500" />
            )}
          </div>
          <Separator />
          <div>
            <p className="text-muted-foreground mb-1">Bio</p>
            <p>{tutor.bio}</p>
          </div>
          <Separator />
          <div>
            <p className="text-muted-foreground mb-1">Qualification</p>
            <p>{tutor.qualification}</p>
          </div>
          <Separator />
          <div className="flex items-center justify-between">
            <span className="text-muted-foreground">Rating</span>
            <div className="flex items-center gap-1">
              <Star className="h-4 w-4 text-yellow-400 fill-yellow-400" />
              <span className="font-medium">{tutor.rating_avg}</span>
              <span className="text-muted-foreground">({tutor.total_reviews} reviews)</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}