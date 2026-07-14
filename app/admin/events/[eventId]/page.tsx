import { cookies, headers } from "next/headers";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import {
  deleteEventAction,
  regenerateEventTokenAction,
} from "@/app/admin/events/actions";
import { readAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import {
  CalendarDays,
  Clock3,
  Edit3,
  MapPin,
  Trash2,
  Users,
  QrCode,
  RefreshCw,
  ChevronLeft,
  Mail,
  FileText,
  User,
  Trophy,
} from "lucide-react";

type EventDetailsPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventDetailsPage({
  params,
}: EventDetailsPageProps) {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  if (!session) {
    redirect("/login");
  }

  const { eventId } = await params;

  // load full event with questions and attendances + their answers
  const eventFull = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      questions: { orderBy: { order: "asc" } },
      attendances: {
        orderBy: { createdAt: "desc" },
        include: { answers: { include: { question: true } } },
      },
    },
  });

  if (!eventFull) {
    notFound();
  }

  const event = eventFull;

  const formatDateTime = new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  const headersList = await headers();

  const protocol =
    headersList.get("x-forwarded-proto") ??
    (headersList.get("host")?.includes("localhost") ? "http" : "https");

  const host = headersList.get("host");

  const checkInUrl = `${protocol}://${host}/attend/${event.token}`;
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

  const status = getStatus(event.startsAt, event.endsAt);
  const questions = eventFull.questions;

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Navigation & Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="min-w-0 space-y-1">
            <Link
              className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-600 mb-1"
              href="/admin"
            >
              <ChevronLeft className="h-4 w-4" />
              Back to dashboard
            </Link>
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
                {event.title}
              </h1>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold ${status.classes}`}
              >
                {status.label}
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              Created on {formatDateTime.format(event.createdAt)}
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            <Link
              className="inline-flex h-10 items-center gap-1.5 rounded border border-slate-300 bg-white px-4 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-orange-700"
              href={`/admin/events/${event.id}/edit`}
            >
              <Edit3 className="h-4 w-4" />
              Edit details
            </Link>

            <form action={deleteEventAction}>
              <input type="hidden" name="eventId" value={event.id} />
              <button
                className="inline-flex h-10 items-center gap-1.5 rounded border border-red-200 bg-red-50 px-4 text-sm font-semibold text-red-700 shadow-xs transition hover:border-red-300 hover:bg-red-100"
                type="submit"
              >
                <Trash2 className="h-4 w-4" />
                Delete event
              </button>
            </form>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left Column: Details & QR Code */}
          <div className="min-w-0 space-y-6 lg:col-span-1">
            {/* Event Info Card */}
            <div className="space-y-4 rounded-md border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 border-b border-slate-100 pb-2">
                Event details
              </h2>

              <div className="space-y-4">
                <div className="flex items-start gap-2.5 text-sm">
                  <MapPin className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700 text-xs">
                      Venue
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {event.venue}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-sm">
                  <CalendarDays className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700 text-xs">
                      Starts At
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {formatDateTime.format(event.startsAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-sm">
                  <Clock3 className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700 text-xs">
                      Ends At
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {formatDateTime.format(event.endsAt)}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 text-sm">
                  <Trophy className="h-4 w-4 text-orange-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold text-slate-700 text-xs">
                      Reward Points
                    </p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {event.rewardPoints} points per attendance
                    </p>
                  </div>
                </div>
              </div>

              {event.description && (
                <div className="pt-4 border-t border-slate-100 space-y-1">
                  <p className="text-xs font-semibold text-slate-700">
                    Description
                  </p>
                  <p className="text-sm text-slate-500 whitespace-pre-wrap leading-relaxed">
                    {event.description}
                  </p>
                </div>
              )}

              {questions.length > 0 && (
                <div className="pt-4 border-t border-slate-100 space-y-2">
                  <p className="text-xs font-semibold text-slate-700">
                    Additional Questions
                  </p>
                  <div className="space-y-2">
                    {questions.map((q) => (
                      <div
                        key={q.id}
                        className="flex items-center justify-between gap-3"
                      >
                        <div>
                          <p className="text-sm font-medium text-slate-700">
                            {q.label}
                          </p>
                          <p className="text-xs text-slate-500">Type: TEXT</p>
                        </div>
                        <div>
                          {q.required ? (
                            <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-semibold bg-amber-50 text-amber-700 border-amber-100">
                              Required
                            </span>
                          ) : (
                            <span className="text-xs text-slate-400 italic">
                              Optional
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* QR Code & Attendance Link Card */}
            <div className="flex flex-col items-center space-y-5 rounded-md border border-slate-200 bg-white p-6 text-center shadow-sm">
              <h2 className="text-lg font-bold tracking-tight text-slate-900 border-b border-slate-100 pb-2 w-full text-left flex items-center gap-1.5">
                <QrCode className="h-5 w-5 text-orange-600" />
                Attendance token
              </h2>

              <div className="flex w-full flex-col items-center justify-center gap-4 rounded-md border border-orange-200 bg-orange-50/40 p-5">
                {/* QR Code Display */}
                <div className="rounded border border-slate-200 bg-white p-3 shadow-xs">
                  <img
                    src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(checkInUrl)}`}
                    alt="Attendance Check-In QR"
                    width={200}
                    height={200}
                    className="w-45 h-45 object-contain"
                  />
                </div>

                {/* Alphanumeric Token Display */}
                <div className="w-full">
                  <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block mb-1.5">
                    Token Value
                  </span>
                  <code className="inline-block select-all rounded border border-slate-300 bg-white px-3 py-2 font-mono text-xs font-bold text-slate-800 shadow-xs">
                    {event.token}
                  </code>
                </div>
              </div>

              {/* Attendance Link */}
              <div className="text-left w-full space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-widest text-slate-400 block">
                  Check-in Link
                </span>
                <a
                  href={checkInUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-orange-600 hover:text-orange-700 hover:underline break-all block font-bold transition-colors"
                >
                  {checkInUrl}
                </a>
              </div>

              {/* Regenerate Token form */}
              <form
                action={regenerateEventTokenAction}
                className="w-full pt-4 border-t border-slate-100"
              >
                <input type="hidden" name="eventId" value={event.id} />
                <button
                  type="submit"
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50 hover:text-orange-700"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Regenerate token
                </button>
                <p className="mt-2.5 text-[10px] text-slate-400 text-center leading-normal">
                  Warning: Regenerating will invalidate any active QR codes or
                  check-in links for this event.
                </p>
              </form>
            </div>
          </div>

          {/* Right Column: Attendance List */}
          <div className="min-w-0 space-y-6 lg:col-span-2">
            <div className="flex min-h-100 flex-col overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
              <div className="px-6 py-5 border-b border-slate-100 flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    <Users className="h-5 w-5 text-orange-600" />
                    Attendance list
                  </h2>
                  <p className="text-sm text-slate-500">
                    Total checked in: {event.attendances.length}
                  </p>
                </div>
              </div>

              {event.attendances.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/20">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-md border border-orange-200 bg-orange-50 text-orange-600 shadow-xs">
                    <Users className="h-6 w-6" />
                  </div>
                  <h3 className="text-base font-bold text-slate-900">
                    No attendance yet
                  </h3>
                  <p className="mt-1 text-sm text-slate-500 max-w-sm">
                    Nobody has checked in for this event yet. Share the QR code
                    or check-in link above to get started.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto flex-1">
                  <table className="w-full text-left text-sm text-slate-850 border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                        <th className="px-6 py-4">Attendee</th>
                        <th className="px-6 py-4">Email</th>
                        <th className="px-6 py-4">Checked-in Time</th>
                        <th className="px-6 py-4">Reason / Notes</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {event.attendances.map((attendee) => {
                        const initials = attendee.name
                          ? attendee.name
                              .split(" ")
                              .map((n) => n[0])
                              .join("")
                              .slice(0, 2)
                              .toUpperCase()
                          : "";
                        return (
                          <tr
                            key={attendee.id}
                            className="transition-colors hover:bg-orange-50/30"
                          >
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center gap-3">
                                <div className="flex h-8 w-8 items-center justify-center rounded border border-orange-200 bg-orange-50 text-xs font-bold text-orange-700 shadow-xs">
                                  {initials || <User className="h-3.5 w-3.5" />}
                                </div>
                                <span className="font-semibold text-slate-850">
                                  {attendee.name}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                              <div className="flex items-center gap-1.5">
                                <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                                <span className="font-medium">
                                  {attendee.email}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-slate-500 font-medium">
                              {formatDateTime.format(
                                new Date(attendee.createdAt),
                              )}
                            </td>
                            <td className="px-6 py-4 text-slate-500">
                              {attendee.reason ? (
                                <div className="flex items-start gap-1.5 max-w-60">
                                  <FileText className="h-3.5 w-3.5 text-slate-450 shrink-0 mt-0.5" />
                                  <span
                                    className="truncate font-medium text-slate-700"
                                    title={attendee.reason}
                                  >
                                    {attendee.reason}
                                  </span>
                                </div>
                              ) : (
                                <span className="text-slate-400 italic text-xs font-medium">
                                  None provided
                                </span>
                              )}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>

            {/* Question answers table */}
            {questions.length > 0 && (
              <div className="overflow-x-auto rounded-md border border-slate-200 bg-white shadow-sm">
                <div className="px-6 py-5 border-b border-slate-100">
                  <h3 className="text-lg font-bold tracking-tight text-slate-900 flex items-center gap-2">
                    Question Answers
                  </h3>
                  <p className="text-sm text-slate-500">
                    Rows per email; name excluded.
                  </p>
                </div>

                {event.attendances.length === 0 ? (
                  <div className="p-8 text-center text-sm text-slate-500">
                    No answers yet
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-slate-850 border-collapse">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                          <th className="px-6 py-3">Email</th>
                          {questions.map((q) => (
                            <th
                              key={q.id}
                              className="max-w-xs wrap-break-word px-6 py-3"
                            >
                              {q.label}
                            </th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {event.attendances.map((att) => {
                          const answersMap: Record<string, string> = {};
                          att.answers.forEach((a) => {
                            answersMap[a.questionId] = a.answer;
                          });

                          return (
                            <tr
                              key={att.id}
                              className="transition-colors hover:bg-orange-50/30"
                            >
                              <td className="px-6 py-3 whitespace-nowrap text-slate-700 font-medium">
                                {att.email}
                              </td>
                              {questions.map((q) => (
                                <td
                                  key={q.id}
                                  className="px-6 py-3 text-slate-500 max-w-xs truncate"
                                >
                                  {answersMap[q.id] ? (
                                    <span
                                      title={answersMap[q.id]}
                                      className="font-medium text-slate-700"
                                    >
                                      {answersMap[q.id]}
                                    </span>
                                  ) : (
                                    <span className="text-xs italic text-slate-400">
                                      —
                                    </span>
                                  )}
                                </td>
                              ))}
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
