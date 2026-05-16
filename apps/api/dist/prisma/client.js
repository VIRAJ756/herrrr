import { PrismaClient } from "@prisma/client";
/** Prisma singleton to avoid hot-reload connection storms. */
export const prisma = globalThis.__guardianPrisma ??
    new PrismaClient({
        log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
    });
if (process.env.NODE_ENV !== "production") {
    globalThis.__guardianPrisma = prisma;
}
