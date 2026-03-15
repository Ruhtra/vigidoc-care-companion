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
  trustedOrigins: process.env.TRUSTED_ORIGINS 
    ? process.env.TRUSTED_ORIGINS.split(",") 
    : [],
  advanced: {
    trustedProxyHeaders: true,
    cookiePrefix: "vigidoc",
  },
  cookie: {
    domain: ".vigidoc.org",
  }
});
