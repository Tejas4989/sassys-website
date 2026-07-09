import type { DefaultSession, DefaultUser } from "next-auth";

declare module "next-auth" {
  interface Session extends DefaultSession {
    user: {
      role: string;
    } & DefaultSession["user"];
    wholesaleCustomerId?: string;
    passcodeMustChange?: boolean;
  }

  interface User extends DefaultUser {
    role: string;
    wholesaleCustomerId?: string;
    passcodeMustChange?: boolean;
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: string;
    wholesaleCustomerId?: string;
    passcodeMustChange?: boolean;
  }
}
