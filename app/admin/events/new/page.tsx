import Link from "next/link";

import { EventForm } from "@/components/event-form";

export default function NewEventPage() {
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
            <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
              Create Event
            </p>
            <h1 className="text-3xl font-extrabold tracking-tight text-slate-900">
              New event details
            </h1>
            <p className="text-sm text-slate-500">
              Add a single event now. QR setup comes later.
            </p>
          </div>
        </div>

        <section className="rounded-2xl border border-slate-100 bg-white p-6 shadow-xs sm:p-8">
          <EventForm mode="create" />
        </section>
      </div>
    </main>
  );
}
