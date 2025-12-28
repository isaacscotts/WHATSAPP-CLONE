import { PrismaClient } from "@prisma/client";
import dotenv from "dotenv"
dotenv.config()
declare global{
//es-lint-disable-next-line no-var
    var prisma:PrismaClient | undefined
}

const prisma=global.prisma || new PrismaClient

if(process.NODE_ENV!=="production"){
    global.prisma=prisma
}

export const db=prisma;