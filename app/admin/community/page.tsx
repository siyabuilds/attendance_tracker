import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";

import { readAdminSession } from "@/lib/auth";
import { calculateAttendancePoints } from "@/lib/attendance";
import { prisma } from "@/lib/prisma";
import {
  ArrowUpRight,
  ChevronLeft,
  Crown,
  Mail,
  Sparkles,
  Trophy,
  Users,
} from "lucide-react";

type AttendanceLeaderboardRow = {
  email: string;
  name: string;
  attendanceCount: number;
  points: number;
  latestCheckInAt: Date;
  eventTitles: string[];
};

function getDisplayName(name: string, email: string) {
  const trimmedName = name.trim();
  if (trimmedName.length > 0) {
    return trimmedName;
  }

  return email;
}

function formatRecentEvents(eventTitles: string[]) {
  if (eventTitles.length === 0) {
    return "No event history yet.";
  }

  if (eventTitles.length === 1) {
    return eventTitles[0];
  }

  if (eventTitles.length === 2) {
    return `${eventTitles[0]} and ${eventTitles[1]}`;
  }

  return `${eventTitles[0]}, ${eventTitles[1]} and ${eventTitles.length - 2} more`;
}

export default async function CommunityLeaderboardPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  if (!session) {
    redirect("/login");
  }

  const attendances = await prisma.attendance.findMany({
    include: {
      event: {
        select: {
          title: true,
          rewardPoints: true,
        },
      },
    },
    orderBy: [
      {
        email: "asc",
      },
      {
        createdAt: "desc",
      },
    ],
  });

  const leaderboardByEmail = new Map<string, AttendanceLeaderboardRow>();

  for (const attendance of attendances) {
    const existingRow = leaderboardByEmail.get(attendance.email);

    if (!existingRow) {
      leaderboardByEmail.set(attendance.email, {
        email: attendance.email,
        name: getDisplayName(attendance.name, attendance.email),
        attendanceCount: 1,
        points: calculateAttendancePoints(attendance.event),
        latestCheckInAt: attendance.createdAt,
        eventTitles: [attendance.event.title],
      });
      continue;
    }

    existingRow.attendanceCount += 1;
    existingRow.points += calculateAttendancePoints(attendance.event);
    existingRow.eventTitles.push(attendance.event.title);
  }

  const leaderboard = Array.from(leaderboardByEmail.values()).sort(
    (left, right) => {
      if (right.points !== left.points) {
        return right.points - left.points;
      }

      if (right.attendanceCount !== left.attendanceCount) {
        return right.attendanceCount - left.attendanceCount;
      }

      return left.name.localeCompare(right.name);
    },
  );

  const totalPeople = leaderboard.length;
  const totalCheckIns = attendances.length;
  const totalPoints = attendances.reduce(
    (sum, attendance) => sum + calculateAttendancePoints(attendance.event),
    0,
  );
  const topAttendee = leaderboard[0];

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/20 px-6 py-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <Link
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-600 mb-1"
                href="/admin"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <p className="text-xs font-semibold text-orange-700">
                Community engagement
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Attendance leaderboard
              </h1>
              <p className="text-sm text-slate-500">
                Attendance is grouped by email, scored from each event&apos;s
                reward points, and ordered by total points so the most engaged
                attendees rise to the top.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
              <Sparkles className="h-4 w-4" />
              Central engagement view
            </div>
          </div>

          <div className="grid gap-4 px-6 py-5 sm:grid-cols-2 xl:grid-cols-4">
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50">
              <p className="text-xs font-semibold text-slate-500">
                Community members
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {totalPeople}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50">
              <p className="text-xs font-semibold text-slate-500">
                Total check-ins
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {totalCheckIns}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50">
              <p className="text-xs font-semibold text-slate-500">
                Total points
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {totalPoints}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50">
              <p className="text-xs font-semibold text-slate-500">Leader</p>
              <p className="mt-2 truncate text-sm font-bold text-slate-800">
                {topAttendee ? topAttendee.name : "No attendance yet"}
              </p>
              <p className="mt-1 text-xs font-medium text-slate-500">
                {topAttendee
                  ? `${topAttendee.points} points`
                  : "Waiting for the first check-in"}
              </p>
            </div>
          </div>
        </section>

        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-3 border-b border-slate-100 px-6 py-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <Trophy className="h-5 w-5 text-orange-600" />
                Engagement table
              </h2>
              <p className="text-sm text-slate-500">
                Sorted by total points in descending order.
              </p>
            </div>
            <p className="text-xs font-semibold text-slate-400">
              Points come from each event&apos;s rewardPoints value
            </p>
          </div>

          {leaderboard.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-3 bg-slate-50/20 px-6 py-16 text-center">
              <div className="flex h-14 w-14 items-center justify-center rounded-md border border-orange-200 bg-orange-50 text-orange-600 shadow-xs">
                <Users className="h-7 w-7" />
              </div>
              <h3 className="text-base font-bold text-slate-900">
                No community data yet
              </h3>
              <p className="max-w-md text-sm text-slate-500">
                Once attendees start checking in, their attendance history will
                appear here as a ranked leaderboard.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-850">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="px-6 py-4">Attendee</th>
                    <th className="px-6 py-4">Email</th>
                    <th className="px-6 py-4">Events attended</th>
                    <th className="px-6 py-4">Points</th>
                    <th className="px-6 py-4">Recent activity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leaderboard.map((entry, index) => {
                    const initials = entry.name
                      .split(" ")
                      .map((part) => part[0])
                      .join("")
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr
                        key={entry.email}
                        className="transition-colors hover:bg-orange-50/30"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded border border-orange-200 bg-orange-50 text-xs font-bold text-orange-700 shadow-xs">
                              {index === 0 ? (
                                <Crown className="h-4 w-4" />
                              ) : (
                                initials || <Users className="h-3.5 w-3.5" />
                              )}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800">
                                {entry.name}
                              </p>
                              <p className="text-[10px] font-bold text-slate-400">
                                Rank #{index + 1}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          <div className="flex items-center gap-1.5">
                            <Mail className="h-3.5 w-3.5 text-slate-400 shrink-0" />
                            <a
                              className="hover:text-orange-700 transition font-medium"
                              href={`mailto:${entry.email}`}
                            >
                              {entry.email}
                            </a>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="inline-flex rounded-lg border border-orange-100 bg-orange-50/60 px-2.5 py-1 text-xs font-semibold text-orange-700">
                            {entry.attendanceCount}{" "}
                            {entry.attendanceCount === 1 ? "event" : "events"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap font-semibold text-slate-900">
                          {entry.points}
                        </td>
                        <td className="px-6 py-4 text-slate-500">
                          <div className="space-y-1">
                            <p
                              className="max-w-104 truncate font-medium text-slate-700"
                              title={formatRecentEvents(entry.eventTitles)}
                            >
                              {formatRecentEvents(entry.eventTitles)}
                            </p>
                            <p className="text-xs text-slate-400">
                              Latest check-in{" "}
                              {entry.latestCheckInAt.toLocaleDateString(
                                "en-ZA",
                                { dateStyle: "medium" },
                              )}
                            </p>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 rounded-md border border-slate-200 bg-white p-5 shadow-sm">
          <p className="text-sm text-slate-500 font-medium">
            Need event-level attendance instead? Jump back to the admin
            dashboard.
          </p>
          <Link
            href="/admin"
            className="inline-flex h-10 items-center gap-2 rounded bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 hover:shadow-md"
          >
            <ArrowUpRight className="h-4 w-4" />
            Open dashboard
          </Link>
        </div>
      </div>
    </main>
  );
}
