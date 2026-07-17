"use server";

import { Prisma } from "@prisma/client";

import {
  attendanceSchema,
  calculateAttendancePoints,
  type AttendanceFormState,
} from "@/lib/attendance";
import { prisma } from "@/lib/prisma";

export async function createAttendanceAction(
  _state: AttendanceFormState,
  formData: FormData,
): Promise<AttendanceFormState> {
  const parsed = attendanceSchema.safeParse({
    name: formData.get("name")?.toString() ?? "",
    email: formData.get("email")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      formError: "Check the highlighted fields and try again.",
    };
  }

  const token = formData.get("token")?.toString().trim() ?? "";

  if (!token) {
    return {
      formError: "Missing check-in token.",
    };
  }

  const event = await prisma.event.findUnique({
    where: { token },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!event) {
    return {
      formError: "This event doesn't exist.",
    };
  }

  const now = new Date();
  if (now < event.startsAt || now > event.endsAt) {
    return {
      formError: "Check-in for this event has closed.",
    };
  }

  const name = parsed.data.name.trim();
  const email = parsed.data.email.trim().toLowerCase();

  const existingAttendance = await prisma.attendance.findFirst({
    where: {
      eventId: event.id,
      email,
    },
  });

  if (existingAttendance) {
    return {
      formError: "Looks like you've already checked in for this event.",
    };
  }

  // validate required question answers
  const questionErrors: Record<string, string[]> = {};
  const answersToSave: { questionId: string; answer: string }[] = [];
  for (const q of event.questions ?? []) {
    const value = formData.get(`answer-${q.id}`)?.toString() ?? "";
    if (q.required && value.trim().length === 0) {
      questionErrors[`answer-${q.id}`] = ["This question is required."];
    } else if (value.trim().length > 0) {
      answersToSave.push({ questionId: q.id, answer: value.trim() });
    }
  }

  if (Object.keys(questionErrors).length > 0) {
    return {
      errors: questionErrors,
      formError: "Check the highlighted fields and try again.",
    };
  }

  const pointsAwarded = calculateAttendancePoints(event, now);

  try {
    await prisma.attendance.create({
      data: {
        eventId: event.id,
        name,
        email,
        pointsAwarded,
        answers: answersToSave.length
          ? {
              create: answersToSave.map((a) => ({
                questionId: a.questionId,
                answer: a.answer,
              })),
            }
          : undefined,
      },
    });
  } catch (error) {
    if (
      error instanceof Prisma.PrismaClientKnownRequestError &&
      error.code === "P2002"
    ) {
      return {
        formError: "Looks like you've already checked in for this event.",
      };
    }

    console.error("Error creating attendance:", error);
    return {
      formError: "We couldn't save your check-in. Please try again.",
    };
  }

  return {
    success: true,
    eventTitle: event.title,
    attendeeName: name,
    checkedInAt: new Date().toISOString(),
  };
}
