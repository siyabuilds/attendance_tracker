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
  Trophy,
} from "lucide-react";

import {
  createEventAction,
  updateEventAction,
} from "@/app/admin/events/actions";
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

function FieldError({
  fieldName,
  messages,
}: {
  fieldName: string;
  messages?: string[];
}) {
  if (!messages?.length) {
    return null;
  }

  return (
    <p
      className="mt-1.5 flex items-center gap-1 text-xs font-semibold text-red-600"
      id={`${fieldName}-error`}
      role="alert"
    >
      <AlertCircle className="h-3.5 w-3.5" />
      {messages[0]}
    </p>
  );
}

function getFieldErrorId(fieldName: string, messages?: string[]) {
  return messages?.length ? `${fieldName}-error` : undefined;
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
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
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
            className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            htmlFor="title"
          >
            Title
          </label>
          <InputShell icon={<PencilLine className="h-4 w-4" />}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="title"
              name="title"
              type="text"
              defaultValue={values.title}
              placeholder="Quarterly planning session"
              aria-invalid={Boolean(state?.errors?.title)}
              aria-describedby={getFieldErrorId("title", state?.errors?.title)}
            />
          </InputShell>
          <FieldError fieldName="title" messages={state?.errors?.title} />
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            htmlFor="venue"
          >
            Venue
          </label>
          <InputShell icon={<MapPin className="h-4 w-4" />}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="venue"
              name="venue"
              type="text"
              defaultValue={values.venue}
              placeholder="Main hall"
              aria-invalid={Boolean(state?.errors?.venue)}
              aria-describedby={getFieldErrorId("venue", state?.errors?.venue)}
            />
          </InputShell>
          <FieldError fieldName="venue" messages={state?.errors?.venue} />
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            htmlFor="rewardPoints"
          >
            Reward Points
          </label>
          <InputShell icon={<Trophy className="h-4 w-4" />}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="rewardPoints"
              name="rewardPoints"
              type="number"
              min={1}
              step={1}
              defaultValue={values.rewardPoints}
              placeholder="10"
              aria-invalid={Boolean(state?.errors?.rewardPoints)}
              aria-describedby={getFieldErrorId(
                "rewardPoints",
                state?.errors?.rewardPoints,
              )}
            />
          </InputShell>
          <FieldError
            fieldName="rewardPoints"
            messages={state?.errors?.rewardPoints}
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            htmlFor="startsAt"
          >
            Starts At
          </label>
          <InputShell icon={<CalendarRange className="h-4 w-4" />}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="startsAt"
              name="startsAt"
              type="datetime-local"
              defaultValue={values.startsAt}
              aria-invalid={Boolean(state?.errors?.startsAt)}
              aria-describedby={getFieldErrorId(
                "startsAt",
                state?.errors?.startsAt,
              )}
            />
          </InputShell>
          <FieldError fieldName="startsAt" messages={state?.errors?.startsAt} />
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-bold uppercase tracking-wider text-slate-500"
            htmlFor="endsAt"
          >
            Ends At
          </label>
          <InputShell icon={<Clock3 className="h-4 w-4" />}>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="endsAt"
              name="endsAt"
              type="datetime-local"
              defaultValue={values.endsAt}
              aria-invalid={Boolean(state?.errors?.endsAt)}
              aria-describedby={getFieldErrorId(
                "endsAt",
                state?.errors?.endsAt,
              )}
            />
          </InputShell>
          <FieldError fieldName="endsAt" messages={state?.errors?.endsAt} />
        </div>
      </div>

      <div className="space-y-2">
        <label
          className="block text-xs font-bold uppercase tracking-wider text-slate-500"
          htmlFor="description"
        >
          Description
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 flex items-start pl-3.5 pt-3.5 text-slate-400">
            <FileText className="h-4 w-4" />
          </div>
          <textarea
            className="min-h-32 w-full resize-y rounded-xl border border-slate-200 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            id="description"
            name="description"
            defaultValue={values.description}
            placeholder="Optional notes for attendees"
            aria-invalid={Boolean(state?.errors?.description)}
            aria-describedby={getFieldErrorId(
              "description",
              state?.errors?.description,
            )}
          />
        </div>
        <FieldError
          fieldName="description"
          messages={state?.errors?.description}
        />
      </div>

      {state?.formError ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50/50 px-4 py-3.5 text-xs font-bold text-red-700 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.formError}</span>
        </div>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-orange-600 px-4.5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-600/15 transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-600/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
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
