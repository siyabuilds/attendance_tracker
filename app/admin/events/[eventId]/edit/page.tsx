import Link from "next/link";
import { notFound } from "next/navigation";

import { EventForm } from "@/components/event-form";
import { prisma } from "@/lib/prisma";

type EventEditPageProps = {
  params: Promise<{
    eventId: string;
  }>;
};

export default async function EventEditPage({ params }: EventEditPageProps) {
  const { eventId } = await params;
  const event = await prisma.event.findUnique({
    where: {
      id: eventId,
    },
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-2">
          <Link
            className="text-sm font-medium text-muted transition hover:text-orange-700"
            href="/admin"
          >
            Back to dashboard
          </Link>
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
              Edit Event
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              Update event details
            </h1>
            <p className="text-sm text-muted">
              Adjust the schedule, venue, or description for this event.
            </p>
          </div>
        </div>

        <section className="rounded-md border border-border bg-surface p-6 shadow-xs sm:p-8">
          <EventForm
            mode="edit"
            event={{
              id: event.id,
              title: event.title,
              description: event.description,
              venue: event.venue,
              rewardPoints: event.rewardPoints,
              startsAt: event.startsAt,
              endsAt: event.endsAt,
            }}
          />
        </section>
      </div>
    </main>
  );
}
