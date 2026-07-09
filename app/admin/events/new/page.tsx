import Link from "next/link";

import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
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
              Create Event
            </p>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              New event details
            </h1>
            <p className="text-sm text-muted">
              Add a single event now. QR setup comes later.
            </p>
          </div>
        </div>

        <section className="rounded-md border border-border bg-surface p-6 shadow-xs sm:p-8">
          <EventForm mode="create" />
        </section>
      </div>
    </main>
  );
}
