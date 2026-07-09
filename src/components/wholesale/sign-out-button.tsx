"use client";

import { signOut } from "next-auth/react";
import { LogOut } from "lucide-react";

export function SignOutButton() {
  return (
    <button
      onClick={() => signOut({ callbackUrl: "/wholesale/login" })}
      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
      aria-label="Sign out"
    >
      <LogOut className="w-4 h-4" />
      <span className="hidden sm:inline">Sign Out</span>
    </button>
  );
}
