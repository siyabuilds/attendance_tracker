import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { readAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { ChevronLeft, Download, Users } from "lucide-react";

export default async function ExportsPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  if (!session) {
    redirect("/login");
  }

  const events = await prisma.event.findMany({
    include: { questions: { orderBy: { order: "asc" } } },
    orderBy: { startsAt: "asc" },
  });

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
          <div className="flex flex-col gap-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/20 px-6 py-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <Link
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-600 mb-1"
                href="/admin"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                Exports
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                CSV exports
              </h1>
              <p className="text-sm text-slate-500">
                Export attendance and leaderboard CSVs for offline analysis.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded-xl border border-orange-100 bg-orange-50/50 px-4 py-2.5 text-sm font-semibold text-orange-700 shadow-xs">
              <Users className="h-4 w-4" />
              Admin exports
            </div>
          </div>

          <div className="space-y-6 px-6 py-6">
            <section className="rounded-lg border border-slate-100 bg-white p-5">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900">
                    Community Leaderboard
                  </h2>
                  <p className="text-sm text-slate-500">
                    Export the current community leaderboard.
                  </p>
                </div>
                <div>
                  <a
                    href="/admin/exports/leaderboard"
                    className="inline-flex items-center gap-2 rounded-xl bg-orange-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/10 hover:bg-orange-500"
                  >
                    <Download className="h-4 w-4" />
                    Export Leaderboard
                  </a>
                </div>
              </div>
            </section>

            <section className="rounded-lg border border-slate-100 bg-white p-5">
              <div className="mb-4">
                <h2 className="text-lg font-bold tracking-tight text-slate-900">
                  Event Attendance
                </h2>
                <p className="text-sm text-slate-500">
                  Choose an event to export attendance including dynamic
                  question columns.
                </p>
              </div>

              <div className="grid gap-4">
                {events.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between rounded-lg border border-slate-100 p-4"
                  >
                    <div>
                      <p className="font-semibold text-slate-900">
                        {event.title}
                      </p>
                      <p className="text-xs text-slate-500">
                        {event.questions.length} question
                        {event.questions.length === 1 ? "" : "s"}
                      </p>
                    </div>
                    <div>
                      <a
                        href={`/admin/exports/event/${event.id}`}
                        className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50"
                      >
                        <Download className="h-4 w-4" />
                        Export
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}
