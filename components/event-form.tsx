"use client";

import { useActionState } from "react";
import {
  AlertCircle,
  CalendarRange,
  Clock3,
  FileText,
  MapPin,
  PencilLine,
  Plus,
} from "lucide-react";

import { createEventAction, updateEventAction } from "@/app/admin/events/actions";
import {
  eventToFormValues,
  type EventFormState,
  type EventFormValues,
  type EventRecordForForm,
} from "@/lib/events";

type EventFormProps = {
  mode: "create" | "edit";
  event?: EventRecordForForm;
};

const initialState: EventFormState = undefined;

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p className="mt-1.5 flex items-center gap-1 text-xs font-medium text-red-600">
      <AlertCircle className="h-3.5 w-3.5" />
      {messages[0]}
    </p>
  );
}

function InputShell({
  icon,
  children,
}: {
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <div className="relative">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-muted">
        {icon}
      </div>
      {children}
    </div>
  );
}

function getButtonLabel(mode: EventFormProps["mode"], pending: boolean) {
  if (pending) {
    return mode === "create" ? "Creating event..." : "Saving event...";
  }

  return mode === "create" ? "Create event" : "Save changes";
}

export function EventForm({ mode, event }: EventFormProps) {
  const [state, formAction, pending] = useActionState(
    mode === "create" ? createEventAction : updateEventAction,
    initialState,
  );
  const values: EventFormValues = eventToFormValues(event);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="mode" value={mode} />
      {event ? <input type="hidden" name="eventId" value={event.id} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
            htmlFor="title"
          >
            Title
          </label>
          <InputShell icon={<PencilLine className="h-4 w-4" />}>
            <input
              className="w-full rounded-md border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted/70 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
              id="title"
              name="title"
              type="text"
              defaultValue={values.title}
              placeholder="Quarterly planning session"
              aria-invalid={Boolean(state?.errors?.title)}
            />
          </InputShell>
          <FieldError messages={state?.errors?.title} />
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
            htmlFor="venue"
          >
            Venue
          </label>
          <InputShell icon={<MapPin className="h-4 w-4" />}>
            <input
              className="w-full rounded-md border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted/70 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
              id="venue"
              name="venue"
              type="text"
              defaultValue={values.venue}
              placeholder="Main hall"
              aria-invalid={Boolean(state?.errors?.venue)}
            />
          </InputShell>
          <FieldError messages={state?.errors?.venue} />
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
            htmlFor="startsAt"
          >
            Starts At
          </label>
          <InputShell icon={<CalendarRange className="h-4 w-4" />}>
            <input
              className="w-full rounded-md border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted/70 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={values.startsAt}
              aria-invalid={Boolean(state?.errors?.startsAt)}
            />
          </InputShell>
          <FieldError messages={state?.errors?.startsAt} />
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-semibold uppercase tracking-wider text-muted"
            htmlFor="endsAt"
          >
            Ends At
          </label>
          <InputShell icon={<Clock3 className="h-4 w-4" />}>
            <input
              className="w-full rounded-md border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted/70 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={values.endsAt}
              aria-invalid={Boolean(state?.errors?.endsAt)}
            />
          </InputShell>
          <FieldError messages={state?.errors?.endsAt} />
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="block text-xs font-semibold uppercase tracking-wider text-muted"
          htmlFor="description"
        >
          Description
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 flex items-start pl-3 pt-3 text-muted">
            <FileText className="h-4 w-4" />
          </div>
          <textarea
            className="min-h-32 w-full resize-y rounded-md border border-border bg-surface py-3 pl-10 pr-4 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted/70 focus:border-orange-500 focus:bg-white focus:ring-2 focus:ring-orange-500/10"
            id="description"
            name="description"
            defaultValue={values.description}
            placeholder="Optional notes for attendees"
            aria-invalid={Boolean(state?.errors?.description)}
          />
        </div>
        <FieldError messages={state?.errors?.description} />
      </div>

      {state?.formError ? (
        <div className="flex items-center gap-2 rounded-md border border-red-100 bg-red-50/70 px-4 py-3 text-xs font-medium text-red-600">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.formError}</span>
        </div>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition-all hover:bg-orange-700 hover:shadow-orange-600/20 active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {mode === "create" ? (
          <Plus className="h-4 w-4" />
        ) : (
          <PencilLine className="h-4 w-4" />
        )}
        {getButtonLabel(mode, pending)}
      </button>
    </form>
  );
}
