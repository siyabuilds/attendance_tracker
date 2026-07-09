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
  reason: z
    .string()
    .trim()
    .max(500, "Keep the reason under 500 characters.")
    .optional(),
});

export type AttendanceFormValues = z.infer<typeof attendanceSchema>;

export type AttendanceFormState =
  | {
      errors?: Partial<Record<keyof AttendanceFormValues, string[]>>;
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

export function calculateAttendancePoints(event: { rewardPoints: number }) {
  return event.rewardPoints;
}

export function getAttendancePoints(attendanceCount: number) {
  return attendanceCount * ATTENDANCE_POINTS;
}
