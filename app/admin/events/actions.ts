"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { eventSchema, type EventFormState } from "@/lib/events";
import { prisma } from "@/lib/prisma";

function parseQuestionsFromForm(formData: FormData) {
  const count = Number(formData.get("questions-count")?.toString() ?? "0");
  const questions: { label: string; required: boolean; order: number }[] = [];
  for (let i = 0; i < count; i++) {
    const label = formData.get(`question-label-${i}`)?.toString() ?? "";
    const required = Boolean(formData.get(`question-required-${i}`));
    const trimmed = label.trim();
    if (trimmed.length > 0) {
      questions.push({ label: trimmed, required, order: i });
    }
  }
  return questions;
}

/**
 * Generates a cryptographically secure 16-character alphanumeric token
 * e.g. "A7kLm29QaBcYtP81"
 */
function generateAttendanceToken(): string {
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
  const bytes = crypto.randomBytes(16);
  let token = "";
  for (let i = 0; i < 16; i++) {
    token += chars[bytes[i] % chars.length];
  }
  return token;
}

export async function createEventAction(
  _state: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const parsed = eventSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    venue: formData.get("venue")?.toString() ?? "",
    locationUrl: formData.get("locationUrl")?.toString() ?? "",
    rewardPoints: formData.get("rewardPoints")?.toString() ?? "",
    pointGraceMinutes: formData.get("pointGraceMinutes")?.toString() ?? "",
    pointDecayIntervalMinutes:
      formData.get("pointDecayIntervalMinutes")?.toString() ?? "",
    pointDecayPercent: formData.get("pointDecayPercent")?.toString() ?? "",
    minimumPoints: formData.get("minimumPoints")?.toString() ?? "",
    startsAt: formData.get("startsAt")?.toString() ?? "",
    endsAt: formData.get("endsAt")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      formError: "Check the highlighted fields and try again.",
    };
  }

  const description = parsed.data.description.trim();
  const eventData = {
    title: parsed.data.title,
    description: description.length > 0 ? description : null,
    venue: parsed.data.venue,
    locationUrl: parsed.data.locationUrl?.length
      ? parsed.data.locationUrl
      : null,
    rewardPoints: parsed.data.rewardPoints,
    pointGraceMinutes: parsed.data.pointGraceMinutes,
    pointDecayIntervalMinutes: parsed.data.pointDecayIntervalMinutes,
    pointDecayPercent: parsed.data.pointDecayPercent,
    minimumPoints: parsed.data.minimumPoints,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
  };

  try {
    const questions = parseQuestionsFromForm(formData);
    await prisma.$transaction(async (tx) => {
      const created = await tx.event.create({
        data: {
          ...eventData,
          token: generateAttendanceToken(),
        },
      });

      if (questions.length) {
        // create questions individually to avoid createMany compatibility issues
        await Promise.all(
          questions.map((q) =>
            tx.eventQuestion.create({
              data: {
                eventId: created.id,
                label: q.label,
                required: q.required,
                order: q.order,
              },
            }),
          ),
        );
      }
    });
  } catch (error) {
    console.error("Error creating event:", error);
    return {
      formError: "Failed to create the event. Please try again.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/community");
  redirect("/admin");
}

export async function updateEventAction(
  _state: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const eventId = formData.get("eventId")?.toString() ?? "";

  if (!eventId) {
    return {
      formError: "Missing event ID.",
    };
  }

  const parsed = eventSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    venue: formData.get("venue")?.toString() ?? "",
    locationUrl: formData.get("locationUrl")?.toString() ?? "",
    rewardPoints: formData.get("rewardPoints")?.toString() ?? "",
    pointGraceMinutes: formData.get("pointGraceMinutes")?.toString() ?? "",
    pointDecayIntervalMinutes:
      formData.get("pointDecayIntervalMinutes")?.toString() ?? "",
    pointDecayPercent: formData.get("pointDecayPercent")?.toString() ?? "",
    minimumPoints: formData.get("minimumPoints")?.toString() ?? "",
    startsAt: formData.get("startsAt")?.toString() ?? "",
    endsAt: formData.get("endsAt")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      formError: "Check the highlighted fields and try again.",
    };
  }

  const description = parsed.data.description.trim();
  const eventData = {
    title: parsed.data.title,
    description: description.length > 0 ? description : null,
    venue: parsed.data.venue,
    locationUrl: parsed.data.locationUrl?.length
      ? parsed.data.locationUrl
      : null,
    rewardPoints: parsed.data.rewardPoints,
    pointGraceMinutes: parsed.data.pointGraceMinutes,
    pointDecayIntervalMinutes: parsed.data.pointDecayIntervalMinutes,
    pointDecayPercent: parsed.data.pointDecayPercent,
    minimumPoints: parsed.data.minimumPoints,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
  };

  try {
    const questions = parseQuestionsFromForm(formData);
    await prisma.$transaction(async (tx) => {
      await tx.event.update({
        where: { id: eventId },
        data: eventData,
      });

      // replace existing questions with submitted set
      await tx.eventQuestion.deleteMany({ where: { eventId } });

      if (questions.length) {
        await Promise.all(
          questions.map((q) =>
            tx.eventQuestion.create({
              data: {
                eventId,
                label: q.label,
                required: q.required,
                order: q.order,
              },
            }),
          ),
        );
      }
    });
  } catch (error) {
    console.error("Error updating event:", error);
    return {
      formError: "Failed to update the event. Please try again.",
    };
  }

  revalidatePath("/admin");
  revalidatePath("/admin/community");
  revalidatePath(`/admin/events/${eventId}`);
  redirect("/admin");
}

export async function regenerateEventTokenAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString() ?? "";

  if (!eventId) {
    throw new Error("Missing event ID.");
  }

  const newToken = generateAttendanceToken();

  try {
    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: {
        token: newToken,
      },
    });
  } catch (error) {
    console.error("Error regenerating event token:", error);
    throw new Error("Failed to regenerate token.");
  }

  revalidatePath("/admin");
  revalidatePath("/admin/community");
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/admin/events/${eventId}`);
}

export async function deleteEventAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString() ?? "";

  if (eventId) {
    try {
      await prisma.event.delete({
        where: {
          id: eventId,
        },
      });
    } catch (error) {
      console.error("Error deleting event:", error);
    }
    revalidatePath("/admin");
    revalidatePath("/admin/community");
  }

  redirect("/admin");
}
