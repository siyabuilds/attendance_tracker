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

function Label({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
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
    <div className="rounded-2xl border border-emerald-100 bg-emerald-50/40 p-6 shadow-xs">
      <div className="flex items-start gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-emerald-100/70 text-emerald-700 shadow-xs border border-emerald-200/50">
          <CheckCircle2 className="h-6 w-6" />
        </div>

        <div className="space-y-2.5">
          <p className="text-[10px] font-bold uppercase tracking-widest text-emerald-750">
            You are checked in
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Thanks, {attendeeName}.
          </h2>
          <p className="text-sm text-slate-550 font-medium">{eventTitle}</p>
          <p className="text-sm text-slate-600 leading-relaxed font-medium">
            Your attendance was recorded at {timeLabel}.
          </p>
          <p className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-100 bg-white px-3.5 py-2 text-xs font-bold text-emerald-700 shadow-xs">
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

      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm space-y-4">
        <div className="space-y-2">
          <p className="text-[10px] font-bold uppercase tracking-widest text-orange-600">
            Attendance details
          </p>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900">
            {eventTitle}
          </h2>
        </div>

        <div className="grid gap-3 text-sm text-slate-500 sm:grid-cols-2">
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/30 px-3.5 py-2.5 font-medium shadow-xs">
            <MapPin className="h-4 w-4 text-orange-600 shrink-0" />
            <span className="truncate">{venue}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/30 px-3.5 py-2.5 font-medium shadow-xs">
            <CalendarDays className="h-4 w-4 text-orange-600 shrink-0" />
            <span>{startsAtLabel}</span>
          </div>
          <div className="flex items-center gap-2 rounded-xl border border-slate-100 bg-slate-50/30 px-3.5 py-2.5 font-medium shadow-xs sm:col-span-2">
            <Clock3 className="h-4 w-4 text-orange-600 shrink-0" />
            <span>Check-in closes at {endsAtLabel}</span>
          </div>
        </div>
      </div>

      <div className="space-y-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label icon={<UserRound className="h-3.5 w-3.5" />}>
              Full Name
            </Label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              name="name"
              type="text"
              placeholder="Samson Mokoena"
              aria-invalid={Boolean(state?.errors?.name)}
              autoComplete="name"
              aria-describedby={getFieldErrorId("name", state?.errors?.name)}
            />
            <FieldError fieldName="name" messages={state?.errors?.name} />
          </div>

          <div className="space-y-2">
            <Label icon={<Mail className="h-3.5 w-3.5" />}>Email Address</Label>
            <input
              className="w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              name="email"
              type="email"
              placeholder="samson@example.com"
              aria-invalid={Boolean(state?.errors?.email)}
              autoComplete="email"
              aria-describedby={getFieldErrorId("email", state?.errors?.email)}
            />
            <FieldError fieldName="email" messages={state?.errors?.email} />
          </div>

          <div className="space-y-2">
            <Label icon={<MessageSquareText className="h-3.5 w-3.5" />}>
              Reason for attending
            </Label>
            <textarea
              className="min-h-28 w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-800 outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              name="reason"
              placeholder="Optional notes, purpose, or session you're attending"
              aria-invalid={Boolean(state?.errors?.reason)}
              aria-describedby={getFieldErrorId(
                "reason",
                state?.errors?.reason,
              )}
            />
            <FieldError fieldName="reason" messages={state?.errors?.reason} />
          </div>
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
