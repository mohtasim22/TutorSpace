import { prisma } from "../../lib/prisma";
import { pick } from "../../lib/pick";

const createCourse = async (payload: any, userID: string) => {

    const userData = await prisma.user.findUnique({
        where: {
            id: userID
        }
    })
    if (!userData) {
        throw new Error("Unauthorized!");
    }
    //  find tutor profile of this user
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: {
            user_id: userID,
        },
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    const result = await prisma.course.create({
        data: {
            ...payload,
            tutor_id: tutorProfile.id
        }
    })
    return result;
}

const getAllCourses = async (userID: string) => {
    const userData = await prisma.user.findUnique({
        where: { id: userID },
    });

    if (!userData) throw new Error("Unauthorized!");

    // admin returns all courses
    if (userData.role === "ADMIN") {
        return prisma.course.findMany({
            include: { tutor: true },
        });
    }

    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { user_id: userID },
    });

    if (!tutorProfile) throw new Error("Tutor profile not found");

    return prisma.course.findMany({
        where: { tutor_id: tutorProfile.id }, 
    });
};
const getAllCourseByTid = async (tutorID: string) => {

    const result = await prisma.course.findMany({
        where: {
            tutor_id: tutorID,
        }
    })
    return result;
}

const updateCourse = async (
    courseID: string,
    payload: Partial<{
        title: string;
        description: string;
        status: "ACTIVE" | "INACTIVE";
    }>,
    userID: string
) => {
    const user = await prisma.user.findUnique({ where: { id: userID } });
    if (!user) throw new Error("User not found");

    const course = await prisma.course.findUnique({ where: { id: courseID } });
    if (!course) throw new Error("Course not found");

    if (user.role !== "ADMIN") {
        const tutorProfile = await prisma.tutorProfile.findUnique({
            where: { user_id: userID },
        });

        if (!tutorProfile) throw new Error("Tutor profile not found");
        if (course.tutor_id !== tutorProfile.id) {
            throw new Error("Unauthorized! You can only update your own courses");
        }
    }

    return prisma.course.update({
        where: { id: courseID },
        // Whitelisted so `tutor_id` cannot be rewritten to hand the course to
        // (or take it from) another tutor.
        data: pick(payload, ["name", "description", "status"]),
    });
};

const deleteCourse = async (courseID: string, userID: string) => {
    const tutorProfile = await prisma.tutorProfile.findUnique({
        where: { user_id: userID },
    });

    if (!tutorProfile) {
        throw new Error("Tutor profile not found");
    }

    const course = await prisma.course.findUnique({
        where: { id: courseID },
    });

    if (!course) {
        throw new Error("Course not found");
    }

    if (course.tutor_id !== tutorProfile.id) {
        throw new Error("Unauthorized! You can only delete your own courses");
    }
    const result = await prisma.course.delete({
        where: {
            id: courseID
        }
    })

    return result;
}

export const courseService = {
    createCourse,
    getAllCourses,
    getAllCourseByTid,
    updateCourse,
    deleteCourse
}
// End of course logical layer

// course abstraction final
