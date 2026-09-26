import { prisma } from "../../lib/prisma";
import { privateUserSelect } from "../../lib/select";

const getAllUsers = async (userID: string) => {
    const userData = await prisma.user.findUnique({
        where: {
            id: userID
        }
    })
    if (!userData) {
        throw new Error("Unauthorized!");
    }

    // An unqualified findMany() returns every scalar column, which includes the
    // bcrypt `password` hash for every account. Name the columns explicitly.
    const result = await prisma.user.findMany({
        select: privateUserSelect,
        orderBy: { createdAt: "desc" },
    })
    return result;
}


const getAdminStats = async () => {
  const [totalUsers, totalBookings, totalCourses, totalReviews] = await Promise.all([
    prisma.user.count(),
    prisma.booking.count(),
    prisma.course.count(),
    prisma.review.count(),
  ]);

  return { totalUsers, totalBookings, totalCourses, totalReviews };
};

const updateUserStatus = async (userId: string, status: "ACTIVE" | "BANNED") => {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error("User not found");

  return prisma.user.update({
    where: { id: userId },
    data: { status },
  });
};

export const adminService = {
    getAllUsers,
    updateUserStatus,
    getAdminStats
}