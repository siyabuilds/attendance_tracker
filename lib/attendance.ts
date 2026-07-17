import { z } from "zod";

export const ATTENDANCE_POINTS = 10;

export const attendanceSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Enter your full name.")
    .max(120, "Keep the name under 120 characters."),
  email: z
    .string()
    .trim()
    .email("Enter a valid email address.")
    .max(254, "Keep the email under 254 characters."),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export type AttendanceFormState =
  | {
      // allow arbitrary keys for dynamic question answer errors (e.g. "answer-<questionId>")
      errors?: Partial<Record<string, string[]>>;
      formError?: string;
    }
  | {
      success: true;
      eventTitle: string;
      attendeeName: string;
      checkedInAt: string;
    }
  | undefined;

export function isAttendanceOpen(
  event: {
    startsAt: Date;
    endsAt: Date;
  },
  now = new Date(),
) {
  return now >= event.startsAt && now <= event.endsAt;
}

export function calculateAttendancePoints(
  event: {
    startsAt: Date;
    endsAt: Date;
    rewardPoints: number;
    pointGraceMinutes: number;
    pointDecayIntervalMinutes: number;
    pointDecayPercent: number;
    minimumPoints: number;
  },
  checkedInAt = new Date(),
) {
  const eventDurationMinutes =
    (event.endsAt.getTime() - event.startsAt.getTime()) / 60_000;

  if (eventDurationMinutes <= 60) {
    return event.rewardPoints;
  }

  const minutesLate = Math.max(
    0,
    Math.floor((checkedInAt.getTime() - event.startsAt.getTime()) / 60_000),
  );

  if (minutesLate <= event.pointGraceMinutes) {
    return event.rewardPoints;
  }

  const completedDecayIntervals = Math.floor(
    (minutesLate - event.pointGraceMinutes) / event.pointDecayIntervalMinutes,
  );
  const decayedPoints = Math.round(
    event.rewardPoints *
      (1 - (completedDecayIntervals * event.pointDecayPercent) / 100),
  );

  return Math.max(event.minimumPoints, decayedPoints);
}

export function getAttendancePoints(attendanceCount: number) {
  return attendanceCount * ATTENDANCE_POINTS;
}
