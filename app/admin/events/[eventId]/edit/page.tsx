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
  // fetch questions explicitly when editing
  const eventWithQuestions = await prisma.event.findUnique({
    where: { id: eventId },
    include: { questions: { orderBy: { order: "asc" } } },
  });

  if (!event) {
    notFound();
  }

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-4xl space-y-6">
        <div className="space-y-2">
          <Link
            className="text-sm font-semibold text-slate-500 transition-colors hover:text-orange-600 mb-1 inline-block"
            href="/admin"
          >
            Back to dashboard
          </Link>
          <div className="space-y-1">
            <p className="text-xs font-semibold text-orange-700">Edit event</p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              Update event details
            </h1>
            <p className="text-sm text-slate-500">
              Adjust the schedule, venue, or description for this event.
            </p>
          </div>
        </div>

        <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
          <EventForm
            mode="edit"
            event={{
              id: event.id,
              title: event.title,
              description: event.description,
              venue: event.venue,
              locationUrl: event.locationUrl,
              rewardPoints: event.rewardPoints,
              pointGraceMinutes: event.pointGraceMinutes,
              pointDecayIntervalMinutes: event.pointDecayIntervalMinutes,
              pointDecayPercent: event.pointDecayPercent,
              minimumPoints: event.minimumPoints,
              startsAt: event.startsAt,
              endsAt: event.endsAt,
              questions: eventWithQuestions?.questions ?? [],
            }}
          />
        </section>
      </div>
    </main>
  );
}
