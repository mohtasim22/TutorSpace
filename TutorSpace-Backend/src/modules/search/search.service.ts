import { prisma } from "../../lib/prisma";

// Public search across verified tutors and active courses.
const searchAll = async (q: string) => {
  const query = (q ?? "").trim();
  if (!query) return { tutors: [], courses: [] };

  const [tutors, courses] = await Promise.all([
    prisma.tutorProfile.findMany({
      where: {
        is_verified: true,
        OR: [
          { display_name: { contains: query, mode: "insensitive" } },
          { qualification: { contains: query, mode: "insensitive" } },
          { bio: { contains: query, mode: "insensitive" } },
        ],
      },
      take: 10,
    }),
    prisma.course.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { description: { contains: query, mode: "insensitive" } },
        ],
      },
      include: { tutor: { select: { id: true, display_name: true } } },
      take: 10,
    }),
  ]);

  return { tutors, courses };
};

export const SearchService = { searchAll };
