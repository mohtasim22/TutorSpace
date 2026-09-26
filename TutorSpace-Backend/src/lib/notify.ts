import { prisma } from "./prisma";

// Fan-out helper: create the same notification for a set of users in one query.
// Other modules call this when something happens (new assignment, grade, etc.).
export const notify = async (
  userIds: string[],
  message: string,
  link?: string,
) => {
  const unique = [...new Set(userIds)].filter(Boolean);
  if (unique.length === 0) return;

  await prisma.notification.createMany({
    data: unique.map((user_id) => ({ user_id, message, link: link ?? null })),
  });
};
