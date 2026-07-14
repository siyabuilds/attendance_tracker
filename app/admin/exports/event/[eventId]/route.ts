import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

function csvEscape(value: unknown) {
  if (value === null || value === undefined) return "";
  const str = typeof value === "string" ? value : String(value);
  if (/[",\n\r,]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`;
  }
  return str;
}

function slugify(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-");
}

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ eventId: string }> },
) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({
    where: { id: eventId },
    include: {
      questions: { orderBy: { order: "asc" } },
      attendances: {
        include: { answers: { include: { question: true } } },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!event) {
    return new NextResponse("Event not found", { status: 404 });
  }

  const questionCols = event.questions.map((q) => q.label);
  const header = ["Name", "Email", "Reason", ...questionCols];
  const rows = [header];

  for (const attendance of event.attendances) {
    const answersByQuestion = new Map();
    for (const ans of attendance.answers) {
      answersByQuestion.set(ans.questionId, ans.answer);
    }

    const dynamicAnswers = event.questions.map((q) =>
      csvEscape(answersByQuestion.get(q.id) ?? ""),
    );

    rows.push([
      csvEscape(attendance.name),
      csvEscape(attendance.email),
      csvEscape(attendance.reason ?? ""),
      ...dynamicAnswers,
    ]);
  }

  const csv = rows.map((r) => r.join(",")).join("\n");
  const date = (event.startsAt as Date).toISOString().slice(0, 10);
  const filename = `${slugify(event.title)}-${date}.csv`;

  return new NextResponse(csv, {
    status: 200,
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
