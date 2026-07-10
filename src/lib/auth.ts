import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { db } from "@/db/client";
import { users, wholesaleCustomers, loginAttempts } from "@/db/schema";
import { eq, and, gte, count } from "drizzle-orm";
import { verifyPassword } from "@/lib/password";

const RATE_LIMIT_WINDOW_MS = 15 * 60 * 1000; // 15 minutes
const MAX_ATTEMPTS = 5;

async function isRateLimited(email: string): Promise<boolean> {
  const windowStart = new Date(Date.now() - RATE_LIMIT_WINDOW_MS);
  const [result] = await db
    .select({ cnt: count() })
    .from(loginAttempts)
    .where(
      and(
        eq(loginAttempts.email, email.toLowerCase()),
        eq(loginAttempts.succeeded, false),
        gte(loginAttempts.attemptedAt, windowStart)
      )
    );
  return (result?.cnt ?? 0) >= MAX_ATTEMPTS;
}

async function recordAttempt(email: string, ip: string, succeeded: boolean) {
  await db.insert(loginAttempts).values({
    email: email.toLowerCase(),
    ip,
    succeeded,
  });
}

export const { handlers, signIn, signOut, auth } = NextAuth({
  secret: process.env.AUTH_SECRET,
  session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 }, // 30 days
  pages: {
    signIn: "/admin/login",
  },
  providers: [
    // Staff login (admin + bakers) — email + password
    Credentials({
      id: "staff",
      name: "Staff",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase();
        const password = String(credentials?.password ?? "");
        if (!email || !password) return null;

        if (await isRateLimited(email)) return null;

        const [user] = await db
          .select()
          .from(users)
          .where(and(eq(users.email, email), eq(users.isActive, true)))
          .limit(1);

        if (
          !user ||
          user.role === "wholesale_customer" ||
          !user.passwordHash
        ) {
          await recordAttempt(email, "unknown", false);
          return null;
        }

        const valid = await verifyPassword(password, user.passwordHash);
        await recordAttempt(email, "unknown", valid);
        if (!valid) return null;

        return { id: user.id, email: user.email, name: user.name, role: user.role };
      },
    }),

    // Wholesale customer login — email + 6-digit passcode
    Credentials({
      id: "wholesale",
      name: "Wholesale",
      credentials: {
        email: { label: "Email", type: "email" },
        passcode: { label: "Passcode", type: "password" },
      },
      async authorize(credentials) {
        const email = String(credentials?.email ?? "").toLowerCase();
        const passcode = String(credentials?.passcode ?? "");
        if (!email || !passcode) return null;

        if (await isRateLimited(email)) return null;

        const [row] = await db
          .select({
            user: users,
            customer: wholesaleCustomers,
          })
          .from(users)
          .innerJoin(wholesaleCustomers, eq(wholesaleCustomers.userId, users.id))
          .where(and(eq(users.email, email), eq(users.isActive, true)))
          .limit(1);

        if (!row) {
          await recordAttempt(email, "unknown", false);
          return null;
        }

        const valid = await verifyPassword(passcode, row.customer.passcodeHash);
        await recordAttempt(email, "unknown", valid);
        if (!valid) return null;

        return {
          id: row.user.id,
          email: row.user.email,
          name: row.user.name,
          role: row.user.role,
          wholesaleCustomerId: row.customer.id,
          passcodeMustChange: row.customer.passcodeMustChange,
        };
      },
    }),
  ],
  callbacks: {
    jwt({ token, user }) {
      if (user) {
        token.role = (user as any).role;
        token.wholesaleCustomerId = (user as any).wholesaleCustomerId;
        token.passcodeMustChange = (user as any).passcodeMustChange;
      }
      return token;
    },
    session({ session, token }) {
      session.user.role = token.role as string;
      (session as any).wholesaleCustomerId = token.wholesaleCustomerId;
      (session as any).passcodeMustChange = token.passcodeMustChange;
      return session;
    },
  },
});
