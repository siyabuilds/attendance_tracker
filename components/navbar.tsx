"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/login/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, CalendarRange } from "lucide-react";

interface NavBarProps {
  email?: string | null;
  isSuperuser?: boolean;
}

export function NavBar({ email, isSuperuser }: NavBarProps) {
  const firstLetter = email ? email.charAt(0).toUpperCase() : "";
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (!ref.current) return;
      if (!ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, []);

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 px-4 py-3 shadow-xs backdrop-blur-md sm:px-6">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded bg-orange-600 text-white shadow-sm transition-transform duration-200 group-hover:scale-105">
            <CalendarRange className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-center">
            <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
              Attendance Tracker
            </span>
            <span className="ml-2 hidden rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600 sm:inline-block">
              Admin
            </span>
          </div>
        </Link>

        {/* Auth status + dropdown */}
        {email ? (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((s) => !s)}
              className="inline-flex min-h-10 items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-orange-700"
              aria-expanded={open}
              aria-haspopup="menu"
            >
              <Avatar className="h-8 w-8 border border-orange-100 shadow-xs">
                <AvatarFallback className="bg-orange-50/70 text-orange-600 font-bold text-sm">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
              <span
                className="hidden max-w-48 truncate text-xs font-semibold text-slate-600 md:inline"
                title={email}
              >
                {email}
              </span>
            </button>

            {open ? (
              <div
                className="absolute right-0 mt-2 w-56 rounded-md border border-slate-200 bg-white py-1 shadow-md"
                role="menu"
              >
                <Link
                  href="/admin"
                  className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-orange-700"
                  role="menuitem"
                >
                  Events
                </Link>
                <Link
                  href="/admin/community"
                  className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-orange-700"
                  role="menuitem"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/admin/exports"
                  className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-orange-700"
                  role="menuitem"
                >
                  Exports
                </Link>
                {isSuperuser && (
                  <Link
                    href="/admin/admins"
                    className="block px-4 py-2.5 text-sm text-slate-700 transition hover:bg-slate-50 hover:text-orange-700 border-t border-slate-100"
                    role="menuitem"
                  >
                    Admin Management
                  </Link>
                )}
                <div className="border-t border-slate-100" />
                <form action={logoutAction} className="m-0">
                  <button
                    type="submit"
                    className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-700 transition hover:bg-red-50"
                    role="menuitem"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    Logout
                  </button>
                </form>
              </div>
            ) : null}
          </div>
        ) : null}
      </div>
    </nav>
  );
}
