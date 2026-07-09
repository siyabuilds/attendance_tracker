"use client";

import { useActionState } from "react";
import type { ReactNode } from "react";
import {
  AlertCircle,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  Mail,
  MessageSquareText,
  MapPin,
  Sparkles,
  UserRound,
} from "lucide-react";

import { createAttendanceAction } from "./actions";
import type { AttendanceFormState } from "@/lib/attendance";

type AttendanceFormProps = {
  token: string;
  eventTitle: string;
  venue: string;
  startsAtLabel: string;
  endsAtLabel: string;
};

const initialState: AttendanceFormState = undefined;

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

function Label({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.2em] text-muted">
      <span className="text-orange-600">{icon}</span>
      <span>{children}</span>
    </div>
  );
}

function SuccessScreen({
  eventTitle,
  attendeeName,
  checkedInAt,
}: Extract<AttendanceFormState, { success: true }>) {
  const timeLabel = new Intl.DateTimeFormat("en-ZA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(checkedInAt));

  return (
    <div className="rounded-md border border-emerald-200 bg-emerald-50/70 p-6 shadow-xs">
      <div className="flex items-start gap-3">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-2">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-700">
            You are checked in
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            Thanks, {attendeeName}.
          </h2>
          <p className="text-sm text-muted">{eventTitle}</p>
          <p className="text-sm text-foreground">
            Your attendance was recorded at {timeLabel}.
          </p>
          <p className="inline-flex items-center gap-1.5 rounded-sm border border-emerald-200 bg-white px-3 py-1.5 text-sm font-medium text-emerald-700">
            <Sparkles className="h-4 w-4" />
            Enjoy the event.
          </p>
        </div>
      </div>
    </div>
  );
}

export function AttendanceForm({
  token,
  eventTitle,
  venue,
  startsAtLabel,
  endsAtLabel,
}: AttendanceFormProps) {
  const [state, formAction, pending] = useActionState(
    createAttendanceAction,
    initialState,
  );

  if (state && "success" in state) {
    return <SuccessScreen {...state} />;
  }

  return (
    <form className="space-y-5" action={formAction}>
      <input type="hidden" name="token" value={token} />

      <div className="rounded-md border border-border bg-white p-5 shadow-xs space-y-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-orange-700">
            Attendance details
          </p>
          <h2 className="text-2xl font-bold tracking-tight text-foreground">
            {eventTitle}
          </h2>
        </div>

        <div className="grid gap-3 text-sm text-muted sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-sm border border-border bg-zinc-50 px-3 py-2.5">
            <MapPin className="h-4 w-4 text-orange-600" />
            <span>{venue}</span>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border bg-zinc-50 px-3 py-2.5">
            <CalendarDays className="h-4 w-4 text-orange-600" />
            <span>{startsAtLabel}</span>
          </div>
          <div className="flex items-center gap-2 rounded-sm border border-border bg-zinc-50 px-3 py-2.5 sm:col-span-2">
            <Clock3 className="h-4 w-4 text-orange-600" />
            <span>Check-in closes at {endsAtLabel}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-md border border-border bg-surface p-5 shadow-xs">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label icon={<UserRound className="h-3.5 w-3.5" />}>
              Full Name
            </Label>
            <input
              className="w-full rounded-sm border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              name="name"
              type="text"
              placeholder="Samson Mokoena"
              aria-invalid={Boolean(state?.errors?.name)}
              autoComplete="name"
            />
            <FieldError messages={state?.errors?.name} />
          </div>

          <div className="space-y-2">
            <Label icon={<Mail className="h-3.5 w-3.5" />}>Email Address</Label>
            <input
              className="w-full rounded-sm border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              name="email"
              type="email"
              placeholder="samson@example.com"
              aria-invalid={Boolean(state?.errors?.email)}
              autoComplete="email"
            />
            <FieldError messages={state?.errors?.email} />
          </div>

          <div className="space-y-2">
            <Label icon={<MessageSquareText className="h-3.5 w-3.5" />}>
              Reason for attending
            </Label>
            <textarea
              className="min-h-28 w-full resize-y rounded-sm border border-border bg-white px-4 py-3 text-sm text-foreground outline-none transition placeholder:text-muted/60 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10"
              name="reason"
              placeholder="Optional notes, purpose, or session you're attending"
              aria-invalid={Boolean(state?.errors?.reason)}
            />
            <FieldError messages={state?.errors?.reason} />
          </div>
        </div>

        {state?.formError ? (
          <div className="flex items-center gap-2 rounded-sm border border-red-100 bg-red-50/80 px-4 py-3 text-sm font-medium text-red-700">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span>{state.formError}</span>
          </div>
        ) : null}

        <button
          className="inline-flex w-full items-center justify-center gap-2 rounded-sm bg-orange-600 px-4 py-3 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
          type="submit"
          disabled={pending}
        >
          {pending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <CheckCircle2 className="h-4 w-4" />
          )}
          {pending ? "Checking you in..." : "Check In"}
        </button>
      </div>
    </form>
  );
}
