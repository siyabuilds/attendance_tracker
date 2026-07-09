"use server";

import crypto from "crypto";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { eventSchema, type EventFormState } from "@/lib/events";
import { prisma } from "@/lib/prisma";

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
    rewardPoints: formData.get("rewardPoints")?.toString() ?? "",
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
    rewardPoints: parsed.data.rewardPoints,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
  };

  try {
    await prisma.event.create({
      data: {
        ...eventData,
        token: generateAttendanceToken(),
      },
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
    rewardPoints: formData.get("rewardPoints")?.toString() ?? "",
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
    rewardPoints: parsed.data.rewardPoints,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
  };

  try {
    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: eventData,
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
