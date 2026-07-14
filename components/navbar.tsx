"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { logoutAction } from "@/app/login/actions";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { LogOut, CalendarRange } from "lucide-react";

interface NavBarProps {
  email?: string | null;
}

export function NavBar({ email }: NavBarProps) {
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

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-slate-100 bg-white/80 backdrop-blur-md px-6 py-3.5 shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between">
        {/* Logo / Brand */}
        <Link
          href="/"
          className="flex items-center gap-2.5 group transition-opacity hover:opacity-95"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-600 text-white shadow-md shadow-orange-600/20 group-hover:scale-105 transition-transform duration-200">
            <CalendarRange className="h-4.5 w-4.5" />
          </div>
          <div className="flex items-center">
            <span className="text-base font-extrabold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors">
              Attendance Tracker
            </span>
            <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-slate-500 hidden sm:inline-block">
              Admin
            </span>
          </div>
        </Link>

        {/* Auth status + dropdown */}
        {email ? (
          <div className="relative" ref={ref}>
            <button
              onClick={() => setOpen((s) => !s)}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 hover:text-orange-600 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-orange-500/20 cursor-pointer shadow-xs"
            >
              <Avatar className="h-8 w-8 border border-orange-100 shadow-xs">
                <AvatarFallback className="bg-orange-50/70 text-orange-600 font-bold text-sm">
                  {firstLetter}
                </AvatarFallback>
              </Avatar>
              <span
                className="hidden md:inline text-xs font-semibold text-slate-600 truncate max-w-[12rem]"
                title={email}
              >
                {email}
              </span>
            </button>

            {open ? (
              <div className="absolute right-0 mt-2 w-56 rounded-lg border border-slate-100 bg-white shadow-md py-2">
                <Link
                  href="/admin"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Events
                </Link>
                <Link
                  href="/admin/community"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Leaderboard
                </Link>
                <Link
                  href="/admin/exports"
                  className="block px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Exports
                </Link>
                <div className="border-t border-slate-100" />
                <form action={logoutAction} className="m-0">
                  <button
                    type="submit"
                    className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2"
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
