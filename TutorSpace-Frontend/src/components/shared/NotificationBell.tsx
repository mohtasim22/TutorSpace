"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { getNotifications, markNotificationsRead } from "@/services/notifications"

type Notif = {
  id: string
  message: string
  link?: string | null
  read: boolean
  createdAt: string
}

export default function NotificationBell() {
  const [items, setItems] = useState<Notif[]>([])
  const [unread, setUnread] = useState(0)

  const load = async () => {
    try {
      const res = await getNotifications()
      if (res?.status === "success") {
        setItems(res.notifications ?? [])
        setUnread(res.unread ?? 0)
      }
    } catch {
      /* ignore — the bell just stays empty */
    }
  }

  useEffect(() => {
    load()
  }, [])

  // Opening the menu marks everything read.
  const onOpenChange = async (open: boolean) => {
    if (open && unread > 0) {
      setUnread(0)
      setItems((prev) => prev.map((n) => ({ ...n, read: true })))
      try {
        await markNotificationsRead()
      } catch {
        /* ignore */
      }
    }
  }

  return (
    <DropdownMenu onOpenChange={onOpenChange}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" aria-label="Notifications" className="relative">
          <Bell className="h-5 w-5" />
          {unread > 0 && (
            <span className="absolute -top-0.5 -right-0.5 h-4 min-w-4 px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
              {unread > 9 ? "9+" : unread}
            </span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80 p-0">
        <div className="px-3 py-2 text-sm font-semibold border-b">
          Notifications
        </div>
        <div className="max-h-80 overflow-y-auto">
          {items.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">
              No notifications
            </p>
          ) : (
            items.map((n) => {
              const body = (
                <div
                  className={`px-3 py-2 text-sm border-b last:border-0 ${
                    !n.read ? "bg-primary/5" : ""
                  }`}
                >
                  <p>{n.message}</p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
              )
              return n.link ? (
                <Link key={n.id} href={n.link} className="block hover:bg-muted/50">
                  {body}
                </Link>
              ) : (
                <div key={n.id}>{body}</div>
              )
            })
          )}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
