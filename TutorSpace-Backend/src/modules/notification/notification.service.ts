import { prisma } from "../../lib/prisma";

// The current user's latest notifications + how many are unread.
const getMyNotifications = async (userId: string) => {
  const notifications = await prisma.notification.findMany({
    where: { user_id: userId },
    orderBy: { createdAt: "desc" },
    take: 20,
  });
  const unread = await prisma.notification.count({
    where: { user_id: userId, read: false },
  });
  return { notifications, unread };
};

// Mark all of the user's notifications as read (called when they open the bell).
const markAllRead = async (userId: string) => {
  await prisma.notification.updateMany({
    where: { user_id: userId, read: false },
    data: { read: true },
  });
  return { success: true };
};

export const NotificationService = { getMyNotifications, markAllRead };
