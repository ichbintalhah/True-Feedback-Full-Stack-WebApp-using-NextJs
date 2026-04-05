"use client";

import Link from "next/link";
import { signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";

const Navbar = () => {
  const { data: session } = useSession();
  const user = session?.user as
    | { username?: string | null; email?: string | null }
    | undefined;

  return (
    <header className="sticky top-0 z-50 border-b border-slate-300/60 bg-background/85 backdrop-blur-md">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <Link href="/" className="group animate-fade-up">
          <span className="bg-linear-to-r from-sky-700 via-cyan-700 to-emerald-700 bg-clip-text text-lg font-semibold tracking-tight text-transparent transition-all duration-300 group-hover:opacity-85 sm:text-xl">
            TrueFeedback
          </span>
        </Link>

        {session ? (
          <div className="flex items-center gap-2 sm:gap-3 animate-fade-up">
            <span className="hidden text-sm text-muted-foreground sm:inline">
              Welcome, {user?.username || user?.email || "User"}
            </span>
            <Link href="/dashboard">
              <Button
                variant="secondary"
                className="h-9 border border-slate-300/60 bg-background px-3 text-xs text-foreground transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 sm:text-sm"
              >
                Dashboard
              </Button>
            </Link>
            <Button
              onClick={() => signOut({ callbackUrl: "/sign-in" })}
              className="h-9 bg-rose-600 px-3 text-xs text-white transition-all duration-200 hover:bg-rose-700 sm:text-sm"
            >
              Logout
            </Button>
          </div>
        ) : (
          <div className="flex items-center gap-2 sm:gap-3 animate-fade-up">
            <Link href="/sign-in">
              <Button
                variant="secondary"
                className="h-9 border border-slate-300/60 bg-background px-4 text-xs text-foreground transition-all duration-200 hover:border-sky-300 hover:bg-sky-50 sm:text-sm"
              >
                Login
              </Button>
            </Link>
            <Link href="/sign-up">
              <Button className="h-9 bg-emerald-600 px-4 text-xs text-white transition-all duration-200 hover:bg-emerald-700 sm:text-sm">
                Sign Up
              </Button>
            </Link>
          </div>
        )}
      </nav>
    </header>
  );
};

export default Navbar;
