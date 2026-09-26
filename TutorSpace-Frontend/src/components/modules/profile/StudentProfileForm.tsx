"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
import { Pencil } from "lucide-react";
import { toast } from "sonner";
import { authClient } from "@/lib/auth-client";

type UserProfile = {
    name: string;
    email: string;
    role: string;
    status: string;
};

export default function StudentProfileForm({ user }: { user: any }) {
    const [profile, setProfile] = useState<UserProfile>(user);
    const [open, setOpen] = useState(false);

    const form = useForm<Pick<UserProfile, "name">>({
        defaultValues: {
            name: profile.name,
        },
    });

    const onSubmit = async (values: Pick<UserProfile, "name">) => {
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

    return (
        <div className="max-w-7xl mx-auto py-10 px-4 space-y-6">
            <h1 className="text-2xl font-bold">Profile Settings</h1>
            {/* Profile Card */}
            <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                    <CardTitle className="text-base">Account Info</CardTitle>
                    <Dialog open={open} onOpenChange={setOpen}>
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
                                    Update your account profile name here.
                                </DialogDescription>
                            </DialogHeader>
                            <Form {...form}>
                                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                                    <FormField
                                        control={form.control}
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
        </div>
    );
}