"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { eventSchema, type EventFormState } from "@/lib/events";
import { prisma } from "@/lib/prisma";

export async function saveEventAction(
  _state: EventFormState,
  formData: FormData,
): Promise<EventFormState> {
  const parsed = eventSchema.safeParse({
    title: formData.get("title")?.toString() ?? "",
    description: formData.get("description")?.toString() ?? "",
    venue: formData.get("venue")?.toString() ?? "",
    startsAt: formData.get("startsAt")?.toString() ?? "",
    endsAt: formData.get("endsAt")?.toString() ?? "",
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      formError: "Check the highlighted fields and try again.",
    };
  }

  const mode = formData.get("mode")?.toString() ?? "create";
  const eventId = formData.get("eventId")?.toString() ?? "";
  const description = parsed.data.description.trim();
  const eventData = {
    title: parsed.data.title,
    description: description.length > 0 ? description : null,
    venue: parsed.data.venue,
    startsAt: new Date(parsed.data.startsAt),
    endsAt: new Date(parsed.data.endsAt),
  };

  if (mode === "edit") {
    if (!eventId) {
      return {
        formError: "Missing event id.",
      };
    }

    await prisma.event.update({
      where: {
        id: eventId,
      },
      data: eventData,
    });
  } else {
    await prisma.event.create({
      data: {
        ...eventData,
        token: crypto.randomUUID(),
      },
    });
  }

  revalidatePath("/admin");
  redirect("/admin");
}

export async function deleteEventAction(formData: FormData) {
  const eventId = formData.get("eventId")?.toString() ?? "";

  if (eventId) {
    await prisma.event.delete({
      where: {
        id: eventId,
      },
    });
    revalidatePath("/admin");
  }

  redirect("/admin");
}
