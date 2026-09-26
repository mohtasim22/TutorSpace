import { prisma } from "../lib/prisma";
import { UserRole } from "../middlewares/auth";
import { auth } from "../lib/auth";

const seedAdmin = async () => {
    console.log("***** Admin Seeding Started....");

    const adminData = {
        name: "Admin",
        email: "admin@gmail.com",
        role: UserRole.admin,
        password: "password123", // Will be hashed securely by Better Auth
    };

    try {
        console.log("Checking if admin already exists...");

        // We delete the existing admin (if any) to ensure the password and other fields stay in sync with this script.
        await prisma.user.deleteMany({
            where: {
                email: adminData.email,
            },
        });

        console.log("Creating fresh admin via Better Auth...");

        // Call Better Auth to seamlessly create User and Account securely
        await auth.api.signUpEmail({
            body: {
                name: adminData.name,
                email: adminData.email,
                password: adminData.password,
                role: adminData.role, // Custom added field
                status: "ACTIVE", // Custom added field
            } as any, // bypassing strict NextJS header inference in programmatic backend script
        });

        console.log("Admin created successfully!");

    } catch (error) {
        console.log(error);
    } finally {
        await prisma.$disconnect()
        process.exit(0);
    }
};

seedAdmin();