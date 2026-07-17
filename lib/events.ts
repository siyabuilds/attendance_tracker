import { z } from "zod";

export const eventSchema = z
  .object({
    title: z
      .string()
      .trim()
      .min(1, "Enter an event title.")
      .max(120, "Keep the title under 120 characters."),
    description: z
      .string()
      .trim()
      .max(500, "Keep the description under 500 characters."),
    venue: z
      .string()
      .trim()
      .min(1, "Enter a venue.")
      .max(120, "Keep the venue under 120 characters."),
    locationUrl: z
      .string()
      .trim()
      .optional()
      .refine((v) => !v || /^(https?:\/\/)/i.test(v), {
        message: "Enter a valid map link.",
      }),
    rewardPoints: z.coerce
      .number()
      .int("Enter whole reward points.")
      .min(1, "Set at least 1 reward point.")
      .max(10000, "Keep the reward points at 10,000 or less."),
    pointGraceMinutes: z.coerce
      .number()
      .int("Enter whole minutes.")
      .min(0, "Grace period cannot be negative.")
      .max(1440, "Keep the grace period to 24 hours or less."),
    pointDecayIntervalMinutes: z.coerce
      .number()
      .int("Enter whole minutes.")
      .min(1, "Set an interval of at least 1 minute.")
      .max(1440, "Keep the interval to 24 hours or less."),
    pointDecayPercent: z.coerce
      .number()
      .int("Enter a whole percentage.")
      .min(1, "Set a decay of at least 1%.")
      .max(100, "Keep the decay at 100% or less."),
    minimumPoints: z.coerce
      .number()
      .int("Enter whole points.")
      .min(1, "Set at least 1 minimum point.")
      .max(10000, "Keep the minimum points at 10,000 or less."),
    startsAt: z
      .string()
      .trim()
      .min(1, "Enter a start date and time.")
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Enter a valid start date and time.",
      }),
    endsAt: z
      .string()
      .trim()
      .min(1, "Enter an end date and time.")
      .refine((value) => !Number.isNaN(Date.parse(value)), {
        message: "Enter a valid end date and time.",
      }),
  })
  .refine(
    (value) => {
      const startsAt = new Date(value.startsAt);
      const endsAt = new Date(value.endsAt);

      return endsAt > startsAt;
    },
    {
      message: "End time must be after start time.",
      path: ["endsAt"],
    },
  )
  .refine((value) => value.minimumPoints <= value.rewardPoints, {
    message: "Minimum points cannot exceed reward points.",
    path: ["minimumPoints"],
  });

export type EventFormValues = z.infer<typeof eventSchema>;

export type EventFormState =
  | {
      // allow arbitrary field keys for dynamic question errors (e.g. "question-label-0")
      errors?: Partial<Record<string, string[]>>;
      formError?: string;
    }
  | undefined;

export type EventRecordForForm = {
  id: string;
  title: string;
  description: string | null;
  venue: string;
  locationUrl?: string | null;
  rewardPoints: number;
  pointGraceMinutes: number;
  pointDecayIntervalMinutes: number;
  pointDecayPercent: number;
  minimumPoints: number;
  startsAt: Date;
  endsAt: Date;
};

function pad(value: number) {
  return String(value).padStart(2, "0");
}

export function formatDateTimeLocal(date: Date) {
  return (
    [date.getFullYear(), pad(date.getMonth() + 1), pad(date.getDate())].join(
      "-",
    ) + `T${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
}

export function eventToFormValues(event?: EventRecordForForm): EventFormValues {
  return {
    title: event?.title ?? "",
    description: event?.description ?? "",
    venue: event?.venue ?? "",
    locationUrl: event?.locationUrl ?? "",
    rewardPoints: event?.rewardPoints ?? 10,
    pointGraceMinutes: event?.pointGraceMinutes ?? 15,
    pointDecayIntervalMinutes: event?.pointDecayIntervalMinutes ?? 15,
    pointDecayPercent: event?.pointDecayPercent ?? 10,
    minimumPoints: event?.minimumPoints ?? 1,
    startsAt: event ? formatDateTimeLocal(event.startsAt) : "",
    endsAt: event ? formatDateTimeLocal(event.endsAt) : "",
  };
}
