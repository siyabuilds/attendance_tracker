import Link from "next/link";
import { logoutAction } from "@/app/login/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, CalendarRange } from "lucide-react";

interface NavBarProps {
  email?: string | null;
}

export function NavBar({ email }: NavBarProps) {
  const firstLetter = email ? email.charAt(0).toUpperCase() : "";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-border bg-surface/95 backdrop-blur-xs px-6 py-4 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2 group transition-opacity hover:opacity-90"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform duration-200">
            <CalendarRange className="h-5 w-5" />
          </div>
          <div>
            <span className="text-lg font-bold tracking-tight text-orange-700">
              Attendance Tracker
            </span>
            <span className="ml-1 text-xs font-semibold uppercase tracking-wider text-muted hidden sm:inline-block">
              Admin
            </span>
          </div>
        </Link>

        {/* Auth status */}
        {email ? (
          <div className="flex items-center gap-4">
            <Link
              href="/admin/community"
              className="hidden rounded-lg border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700 transition hover:bg-orange-100 hover:text-orange-800 md:inline-flex"
            >
              Leaderboard
            </Link>
            <div className="flex items-center gap-2.5">
              <Avatar className="h-9 w-9 border border-orange-200 shadow-xs">
                <AvatarFallback className="bg-orange-50 text-orange-600 font-bold text-sm">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
              <span
                className="hidden md:inline text-sm font-medium text-muted"
                title={email}
              >
                {email}
              </span>
            </div>
            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex h-9 items-center justify-center gap-1.5 rounded-lg border border-border bg-surface px-3 text-sm font-medium text-foreground hover:bg-zinc-50 hover:text-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </form>
          </div>
        ) : null}
      </div>
    </nav>
  );
}
