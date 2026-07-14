import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateAttendancePoints } from "@/lib/attendance";

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : String(value);
  if (/[",\n\r,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

export async function GET() {
  const attendances = await prisma.attendance.findMany({
    include: {
      event: { select: { title: true, rewardPoints: true } },
    },
    orderBy: [{ email: "asc" }, { createdAt: "desc" }],
  });

  const leaderboardByEmail = new Map();

  for (const attendance of attendances) {
    const existing = leaderboardByEmail.get(attendance.email);
    const name = attendance.name?.trim() ?? "";
    const displayName = name.length > 0 ? name : attendance.email;

    if (!existing) {
      leaderboardByEmail.set(attendance.email, {
        email: attendance.email,
        name: displayName,
        attendanceCount: 1,
        points: calculateAttendancePoints(attendance.event),
        latestCheckInAt: attendance.createdAt,
      });
      continue;
    }

    existing.attendanceCount += 1;
    existing.points += calculateAttendancePoints(attendance.event);
    if (attendance.createdAt > existing.latestCheckInAt) {
      existing.latestCheckInAt = attendance.createdAt;
    }
  }

  const leaderboard = Array.from(leaderboardByEmail.values()).sort(
    (a: any, b: any) => b.points - a.points,
  );

  const rows = [];
  rows.push([
    "Name",
    "Email",
    "Total Points",
    "Number of Check-ins",
    "Last Check-in Date",
  ]);

  for (const row of leaderboard) {
    rows.push([
      csvEscape(row.name),
      csvEscape(row.email),
      csvEscape(row.points),
      csvEscape(row.attendanceCount),
      csvEscape(row.latestCheckInAt.toISOString()),
    ]);
  }

  const csv = rows.map((r) => r.join(",")).join("\n");
  const date = new Date().toISOString().slice(0, 10);
  const filename = `community-leaderboard-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
