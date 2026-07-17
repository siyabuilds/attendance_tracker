import { type ReactNode } from "react";

import {
  AlertTriangle,
  CalendarDays,
  Clock3,
  LockKeyhole,
  MapPin,
  Sparkles,
  ExternalLink,
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
    <div className="rounded-md border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-orange-200 bg-orange-50 text-orange-700 shadow-xs">
          {icon}
        </div>
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="text-sm leading-relaxed text-slate-500">{message}</p>
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
  // load questions for the attendance form
  const eventWithQuestions = await prisma.event.findUnique({
    where: { token },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!event) {
    return (
      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 lg:px-8 bg-slate-50/20">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-linear-to-b from-orange-50/50 to-transparent" />
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
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
      <main className="relative flex-1 overflow-hidden px-4 py-10 sm:px-6 lg:px-8 bg-slate-50/20">
        <div className="absolute inset-x-0 top-0 -z-10 h-64 bg-linear-to-b from-orange-50/50 to-transparent" />
        <div className="mx-auto flex w-full max-w-2xl items-center justify-center">
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
    <main className="relative flex-1 overflow-hidden px-4 py-8 sm:px-6 lg:px-8 bg-slate-50/20">
      <div className="absolute inset-x-0 top-0 -z-10 h-72 bg-linear-to-b from-orange-50/60 via-orange-50/20 to-transparent" />

      <div className="mx-auto grid w-full max-w-5xl gap-6 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
        <section className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
          <div className="inline-flex items-center gap-2 rounded border border-orange-200 bg-orange-50 px-3 py-1.5 text-xs font-semibold text-orange-700">
            <Sparkles className="h-3.5 w-3.5" />
            Public check-in
          </div>

          <div className="space-y-3">
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
              {event.title}
            </h1>
            {event.description ? (
              <p className="max-w-xl text-sm leading-relaxed text-slate-500">
                {event.description}
              </p>
            ) : null}
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="flex items-start gap-2 rounded border border-orange-200 bg-orange-50 px-3 py-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-orange-600" />

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-orange-800">
                  {event.venue}
                </p>

                {event.locationUrl && (
                  <a
                    href={event.locationUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-1 inline-flex items-center text-sm font-medium text-orange-600 hover:underline group"
                  >
                    Open in Maps
                    <ExternalLink className="ml-1.5 h-3.5 w-3.5 text-orange-600 transform transition-colors transition-transform group-hover:translate-x-1 group-hover:text-orange-700" />
                  </a>
                )}
              </div>
            </div>
            <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm">
              <CalendarDays className="h-4 w-4 text-orange-600 shrink-0" />
              <span className="font-medium">{formatDate(event.startsAt)}</span>
            </div>
            <div className="flex items-center gap-2 rounded border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm sm:col-span-2">
              <Clock3 className="h-4 w-4 text-orange-600 shrink-0" />
              <span className="font-medium">
                Check-in closes at {formatDateTime(event.endsAt)}
              </span>
            </div>
          </div>

          <p className="text-sm text-slate-400 font-medium">
            Please complete the form below so we can record your attendance.
          </p>
        </section>

        <section className="space-y-4">
          <AttendanceForm
            token={event.token}
            eventTitle={event.title}
            venue={event.venue}
            startsAtLabel={formatDate(event.startsAt)}
            endsAtLabel={formatDateTime(event.endsAt)}
            questions={eventWithQuestions?.questions ?? []}
          />
        </section>
      </div>
    </main>
  );
}
