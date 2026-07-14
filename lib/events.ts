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
    rewardPoints: z.coerce
      .number()
      .int("Enter whole reward points.")
      .min(1, "Set at least 1 reward point.")
      .max(10000, "Keep the reward points at 10,000 or less."),
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
  );

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
  rewardPoints: number;
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
    rewardPoints: event?.rewardPoints ?? 10,
    startsAt: event ? formatDateTimeLocal(event.startsAt) : "",
    endsAt: event ? formatDateTimeLocal(event.endsAt) : "",
  };
}
