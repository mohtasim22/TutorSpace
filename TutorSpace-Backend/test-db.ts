import { prisma } from './src/lib/prisma';

async function main() {
    const user = await prisma.user.findUnique({
        where: { email: "fahimatbd@gmail.com" },
        include: { accounts: true }
    });
    console.log("User details:", user);
    
    const allEmails = (await prisma.user.findMany({ select: { email: true } })).map(u => u.email);
    console.log("\nAll emails:", allEmails.join(", "));
}

main().finally(() => prisma.$disconnect());
