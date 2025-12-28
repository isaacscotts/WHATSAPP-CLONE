import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv";
dotenv.config();

const globalPrisma = globalThis.prisma || new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalThis.prisma = globalPrisma;
}

export const db = globalPrisma;
export default globalPrisma;
