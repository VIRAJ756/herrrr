import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var __guardianPrisma: PrismaClient | undefined;
}

/** Prisma singleton to avoid hot-reload connection storms. */
export const prisma: PrismaClient =
  globalThis.__guardianPrisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"]
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__guardianPrisma = prisma;
}

