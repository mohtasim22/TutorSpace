import { AppSidebar } from "@/components/app-sidebar"
import NotificationBell from "@/components/shared/NotificationBell"

import { Separator } from "@/components/ui/separator"
import {
    SidebarInset,
    SidebarProvider,
    SidebarTrigger,
} from "@/components/ui/sidebar"
import { getUser } from "@/services/auth"
// app/(DashboardLayout)/layout.tsx
export const dynamic = "force-dynamic"
export default async function DashboardLayout({
    admin,
    student,
    tutor
}: {
    admin: React.ReactNode,
    student: React.ReactNode,
    tutor: React.ReactNode,
    children: React.ReactNode
}) {
    const user = await getUser();
    return (
        <SidebarProvider>
            <AppSidebar 
            userRole={user?.role || "STUDENT"} 
            userName={user?.name}  // ✅ pass name
            />
            <SidebarInset>
                <header className="flex h-16 shrink-0 items-center justify-between gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
                    <div className="flex items-center gap-2 px-4">
                        <SidebarTrigger className="-ml-1" />
                        <Separator
                            orientation="vertical"
                            className="mr-2 data-[orientation=vertical]:h-4"
                        />
                    </div>
                    <div className="px-4">
                        <NotificationBell />
                    </div>
                </header>
                {/* Padding is deliberately small on phones. These two wrappers
                    previously nested p-4 inside p-6 — 40px of gutter on each
                    side, which is a fifth of a 375px screen consumed before any
                    content renders. */}
                <div className="flex flex-1 flex-col gap-4 p-2 pt-0 sm:p-4">
                    <div className="bg-white/5 backdrop-blur-md border border-white/10 min-h-[100vh] flex-1 rounded-xl md:min-h-min p-3 sm:p-6">
                        {user?.role === "ADMIN" && admin}
                        {user?.role === "STUDENT" && student}
                        {user?.role === "TUTOR" && tutor}
                        
                    </div>
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
