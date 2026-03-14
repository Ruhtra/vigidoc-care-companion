import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { prisma } from "@/lib/prisma";

export const auth = betterAuth({
  database: prismaAdapter(prisma, {
    provider: "postgresql",
  }),
  emailAndPassword: {
    enabled: true,
  },
  user: {
    additionalFields: {
      role: {
        type: "string",
        defaultValue: "user",
      },
    },
  },
  trustedOrigins: [
    "http://localhost:8080",
    "http://localhost:8080/",
    "http://localhost:5173",
    "https://b62c-189-124-139-83.ngrok-free.app"
  ],
  advanced: {
    trustedProxyHeaders: true,
  }
});
