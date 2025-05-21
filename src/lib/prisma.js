import { PrismaClient } from "@prisma/client";

let prisma;

if (process.env.NODE_ENV === "production") {
  prisma = new PrismaClient();
} else {
  // Чтобы не создавать кучу инстансов при работе с hot-reload
  if (!global.prisma) {
    global.prisma = new PrismaClient();
  }
  prisma = global.prisma;
}

export default prisma;
