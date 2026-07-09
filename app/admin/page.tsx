import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { deleteEventAction } from "@/app/admin/events/actions";
import { readAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CalendarDays,
  Clock3,
  Edit3,
  MapPin,
  Plus,
  Trash2,
  Users,
  Eye,
} from "lucide-react";

function getRelativeDateLabel(date: Date): string {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const target = new Date(date);
  target.setHours(0, 0, 0, 0);

  const diffTime = target.getTime() - today.getTime();
  const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Tomorrow";
  if (diffDays === -1) return "Yesterday";
  return "";
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  if (!session) {
    redirect("/login");
  }

  const events = await prisma.event.findMany({
    include: {
      _count: {
        select: { attendances: true },
      },
    },
    orderBy: {
      startsAt: "asc",
    },
  });

  const now = new Date();
  const upcomingEvents = events.filter((event) => event.startsAt > now).length;
  const activeEvents = events.filter(
    (event) => now >= event.startsAt && now <= event.endsAt,
  ).length;
  const completedEvents = events.filter((event) => event.endsAt < now).length;

  const formatDateTime = new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const getEventDateText = (date: Date) => {
    const relative = getRelativeDateLabel(date);
    const timeStr = date.toLocaleTimeString("en-ZA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    if (relative) {
      return `${relative}, ${timeStr}`;
    }
    return formatDateTime.format(date);
  };

  const getStatus = (startsAt: Date, endsAt: Date) => {
    const now = new Date();
    if (now < startsAt) {
      return {
        label: "Upcoming",
        classes: "bg-sky-50 text-sky-700 border-sky-100",
      };
    }
    if (now >= startsAt && now <= endsAt) {
      return {
        label: "Active",
        classes:
          "bg-emerald-50 text-emerald-700 border-emerald-100 animate-pulse",
      };
    }
    return {
      label: "Completed",
      classes: "bg-slate-100 text-slate-600 border-slate-200/50",
    };
  };

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-xs">
          <div className="flex flex-col gap-6 border-b border-slate-100 bg-linear-to-br from-slate-50 via-white to-orange-50/20 px-6 py-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
                Admin Dashboard
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Event management
              </h1>
              <p className="text-sm text-slate-500">
                Welcome back,{" "}
                <span className="font-semibold text-slate-800">
                  {session.email}
                </span>
                . Create events, edit schedules, and keep the event list
                current.
              </p>
            </div>

            <Link
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-600/20 active:scale-[0.98] cursor-pointer"
              href="/admin/events/new"
            >
              <Plus className="h-4 w-4" />
              Create event
            </Link>
          </div>

          <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-slate-50 hover:shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Total events
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {events.length}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-slate-50 hover:shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Upcoming events
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {upcomingEvents}
              </p>
            </div>
            <div className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 transition-all hover:bg-slate-50 hover:shadow-xs">
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">
                Active now
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {activeEvents}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {completedEvents} completed
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900">
                Event list
              </h2>
              <p className="text-sm text-slate-500">
                Click an event to view details, QR code, and attendance.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="rounded-2xl border-2 border-dashed border-slate-200 bg-white p-12 text-center shadow-xs max-w-md mx-auto">
              <CalendarDays className="mx-auto h-12 w-12 text-orange-500/80 mb-4" />
              <h3 className="text-base font-bold text-slate-900">
                No events yet
              </h3>
              <p className="mt-1 text-sm text-slate-500">
                Create the first event to get the dashboard moving.
              </p>
              <Link
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-xl bg-orange-600 px-4.5 py-2.5 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-600/20 active:scale-[0.98]"
                href="/admin/events/new"
              >
                <Plus className="h-4 w-4" />
                Create event
              </Link>
            </div>
          ) : (
            <div className="grid gap-4 xl:grid-cols-2">
              {events.map((event) => {
                const status = getStatus(event.startsAt, event.endsAt);
                return (
                  <article
                    key={event.id}
                    className="group relative rounded-2xl border border-slate-100 bg-white p-6 shadow-sm transition-all duration-300 hover:border-orange-200/80 hover:shadow-md hover:-translate-y-0.5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="text-lg font-bold tracking-tight text-slate-900 group-hover:text-orange-600 transition-colors duration-200"
                          >
                            {event.title}
                          </Link>
                          <p className="text-sm text-slate-500 line-clamp-2 leading-relaxed">
                            {event.description || "No description added yet."}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.classes}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1">
                          <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          {event.venue}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1">
                          <CalendarDays className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          {getEventDateText(event.startsAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-slate-100 bg-slate-50/80 px-2.5 py-1">
                          <Clock3 className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          Ends {getEventDateText(event.endsAt)}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-orange-100 bg-orange-50/60 px-2.5 py-1 font-semibold text-orange-700">
                          <Users className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          {event._count.attendances}{" "}
                          {event._count.attendances === 1
                            ? "attendee"
                            : "attendees"}
                        </span>
                        <span className="inline-flex items-center gap-1.5 rounded-lg border border-amber-100 bg-amber-50/60 px-2.5 py-1 font-semibold text-amber-700">
                          Reward Points: {event.rewardPoints}
                        </span>
                      </div>
                    </div>

                    <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between gap-4">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-bold text-orange-600 hover:text-orange-700 transition-colors duration-200"
                      >
                        <Eye className="h-4 w-4" />
                        View details
                      </Link>

                      <div className="flex gap-2">
                        <Link
                          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200/80 bg-white px-3.5 py-1.5 text-xs font-bold text-slate-700 hover:bg-slate-50 hover:text-orange-600 transition shadow-xs cursor-pointer"
                          href={`/admin/events/${event.id}/edit`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </Link>

                        <form action={deleteEventAction}>
                          <input
                            type="hidden"
                            name="eventId"
                            value={event.id}
                          />
                          <button
                            className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50/50 px-3.5 py-1.5 text-xs font-bold text-red-700 hover:bg-red-100 hover:border-red-300 transition shadow-xs cursor-pointer"
                            type="submit"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                          </button>
                        </form>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
