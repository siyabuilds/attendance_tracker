import { type ReactNode } from "react";

import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  LockKeyhole,
  MapPin,
  Sparkles,
} from "lucide-react";

import { AttendanceForm } from "./attendance-form";
import { isAttendanceOpen } from "@/lib/attendance";
import { prisma } from "@/lib/prisma";

type AttendPageProps = {
  params: Promise<{
    token: string;
  }>;
};

function formatDate(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
  }).format(date);
}

function formatDateTime(date: Date) {
  return new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}

function NoticeCard({
  title,
  message,
  icon,
}: {
  title: string;
  message: string;
  icon: ReactNode;
}) {
  return (
    <div className="rounded-md border border-border bg-surface p-6 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-700">
          {icon}
        </div>
        <div className="space-y-2">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            {title}
          </h1>
          <p className="text-sm leading-6 text-muted">{message}</p>
        </div>
      </div>
    </div>
  );
}

export default async function AttendPage({ params }: AttendPageProps) {
  const { token } = await params;
  const event = await prisma.event.findUnique({
    where: {
      token,
    },
  });

  if (!event) {
    return (
      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-linear-to-b from-orange-50 to-transparent" />
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
          <NoticeCard
            title="Invalid Token"
            message="This event doesn't exist. Please ask the event staff for a fresh check-in link or QR code."
            icon={<AlertTriangle className="h-6 w-6" />}
          />
        </div>
      </main>
    );
  }

  if (!isAttendanceOpen(event)) {
    return (
      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 lg:px-8">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-linear-to-b from-orange-50 to-transparent" />
        <div className="mx-auto flex w-full max-w-3xl items-center justify-center">
          <NoticeCard
            title="Attendance Closed"
            message="Check-in for this event has closed. If you think this is a mistake, please speak to an event organizer."
            icon={<LockKeyhole className="h-6 w-6" />}
          />
        </div>
      </main>
    );
  }

  return (
    <main className="relative flex-1 overflow-hidden px-4 py-8 sm:px-6 lg:px-8">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-orange-50 via-orange-50/60 to-transparent" />
      <div className="absolute -right-24 top-16 -z-10 h-64 w-64 rounded-full bg-orange-100/70 blur-3xl" />
      <div className="absolute -left-24 bottom-0 -z-10 h-64 w-64 rounded-full bg-amber-100/60 blur-3xl" />

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <section className="space-y-4 rounded-md border border-border bg-surface p-6 shadow-xs">
          <div className="inline-flex items-center gap-2 rounded-full border border-orange-200 bg-orange-50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
            <Sparkles className="h-3.5 w-3.5" />
            Public check-in
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              {event.title}
            </h1>
            {event.description ? (
              <p className="max-w-xl text-sm leading-6 text-muted">
                {event.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <div className="flex items-center gap-2 rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-muted shadow-xs">
              <MapPin className="h-4 w-4 text-orange-600" />
              <span>{event.venue}</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-muted shadow-xs">
              <CalendarDays className="h-4 w-4 text-orange-600" />
              <span>{formatDate(event.startsAt)}</span>
            </div>
            <div className="flex items-center gap-2 rounded-sm border border-border bg-white px-3 py-2.5 text-sm text-muted shadow-xs sm:col-span-2">
              <Clock3 className="h-4 w-4 text-orange-600" />
              <span>Check-in closes at {formatDateTime(event.endsAt)}</span>
            </div>
          </div>

          <p className="text-sm text-muted">
            Please complete the form on the right so we can record your
            attendance.
          </p>
        </section>

        <section className="space-y-4">
          <AttendanceForm
            token={event.token}
            eventTitle={event.title}
            venue={event.venue}
            startsAtLabel={formatDate(event.startsAt)}
            endsAtLabel={formatDateTime(event.endsAt)}
          />
        </section>
      </div>
    </main>
  );
}
