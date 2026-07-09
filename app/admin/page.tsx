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

  const formatDateTime = new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const getEventDateText = (date: Date) => {
    const relative = getRelativeDateLabel(date);
    const timeStr = date.toLocaleTimeString("en-ZA", { hour: "2-digit", minute: "2-digit" });
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
        classes: "bg-blue-50 text-blue-700 border-blue-200",
      };
    }
    if (now >= startsAt && now <= endsAt) {
      return {
        label: "Active",
        classes: "bg-emerald-50 text-emerald-700 border-emerald-200 animate-pulse",
      };
    }
    return {
      label: "Completed",
      classes: "bg-zinc-100 text-zinc-600 border-zinc-200",
    };
  };

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6">
        <section className="overflow-hidden rounded-md border border-border bg-surface shadow-xs">
          <div className="flex flex-col gap-6 border-b border-border bg-linear-to-r from-orange-50 to-amber-50 px-6 py-6 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
                Admin Dashboard
              </p>
              <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                Event management
              </h1>
              <p className="text-sm text-muted">
                Welcome back,{" "}
                <span className="font-semibold text-foreground">
                  {session.email}
                </span>
                . Create events, edit schedules, and keep the event list
                current.
              </p>
            </div>

            <Link
              className="inline-flex items-center justify-center gap-2 rounded-sm bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition hover:bg-orange-700"
              href="/admin/events/new"
            >
              <Plus className="h-4 w-4" />
              Create event
            </Link>
          </div>

          <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
            <div className="rounded-md border border-border bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Total events
              </p>
              <p className="mt-2 text-3xl font-bold text-foreground">
                {events.length}
              </p>
            </div>
            <div className="rounded-md border border-border bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Upcoming first
              </p>
              <p className="mt-2 text-sm font-medium text-foreground">
                Sorted by start date
              </p>
            </div>
            <div className="rounded-md border border-border bg-white p-4 shadow-xs">
              <p className="text-xs font-semibold uppercase tracking-wider text-muted">
                Signed in as
              </p>
              <p className="mt-2 truncate text-sm font-medium text-foreground">
                {session.email}
              </p>
            </div>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <div>
              <h2 className="text-lg font-semibold tracking-tight text-foreground">
                Event list
              </h2>
              <p className="text-sm text-muted">
                Click an event to view details, QR code, and attendance.
              </p>
            </div>
          </div>

          {events.length === 0 ? (
            <div className="rounded-md border border-dashed border-border bg-surface p-8 text-center shadow-xs">
              <CalendarDays className="mx-auto h-10 w-10 text-orange-600" />
              <h3 className="mt-4 text-base font-semibold text-foreground">
                No events yet
              </h3>
              <p className="mt-1 text-sm text-muted">
                Create the first event to get the dashboard moving.
              </p>
              <Link
                className="mt-5 inline-flex items-center justify-center gap-2 rounded-sm bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition hover:bg-orange-700"
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
                    className="group relative rounded-md border border-border bg-surface p-5 shadow-xs transition hover:border-orange-200 hover:shadow-md hover:shadow-orange-600/5 flex flex-col justify-between"
                  >
                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1">
                          <Link
                            href={`/admin/events/${event.id}`}
                            className="text-lg font-semibold tracking-tight text-foreground hover:text-orange-600 transition-colors"
                          >
                            {event.title}
                          </Link>
                          <p className="text-sm text-muted line-clamp-2">
                            {event.description || "No description added yet."}
                          </p>
                        </div>
                        <span
                          className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.classes}`}
                        >
                          {status.label}
                        </span>
                      </div>

                      <div className="flex flex-wrap gap-2 text-xs text-muted">
                        <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1">
                          <MapPin className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          {event.venue}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1">
                          <CalendarDays className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          {getEventDateText(event.startsAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-white px-2 py-1">
                          <Clock3 className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          Ends {getEventDateText(event.endsAt)}
                        </span>
                        <span className="inline-flex items-center gap-1 rounded-sm border border-border bg-orange-50/50 px-2 py-1 font-medium text-orange-700">
                          <Users className="h-3.5 w-3.5 text-orange-600 shrink-0" />
                          {event._count.attendances}{" "}
                          {event._count.attendances === 1 ? "attendee" : "attendees"}
                        </span>
                      </div>
                    </div>

                    <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-4">
                      <Link
                        href={`/admin/events/${event.id}`}
                        className="inline-flex items-center gap-1.5 text-sm font-medium text-orange-600 hover:text-orange-700 transition"
                      >
                        <Eye className="h-4 w-4" />
                        View details
                      </Link>

                      <div className="flex gap-2">
                        <Link
                          className="inline-flex items-center gap-1.5 rounded-sm border border-border bg-white px-3 py-1.5 text-sm font-medium text-foreground transition hover:border-orange-200 hover:text-orange-700"
                          href={`/admin/events/${event.id}/edit`}
                        >
                          <Edit3 className="h-3.5 w-3.5" />
                          Edit
                        </Link>

                        <form action={deleteEventAction}>
                          <input type="hidden" name="eventId" value={event.id} />
                          <button
                            className="inline-flex items-center gap-1.5 rounded-sm border border-red-200 bg-red-50 px-3 py-1.5 text-sm font-medium text-red-700 transition hover:border-red-300 hover:bg-red-100 cursor-pointer"
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
