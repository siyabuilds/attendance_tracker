"use client";

import { useActionState, useState } from "react";
import {
  AlertCircle,
  ArrowDown,
  ArrowUp,
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

type QuestionItem = {
  id?: string;
  label: string;
  required: boolean;
  order: number;
};

type EventFormProps = {
  mode: "create" | "edit";
  event?: EventRecordForForm & { questions?: QuestionItem[] };
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
      className="mt-1.5 flex items-center gap-1.5 text-xs font-medium text-red-700"
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

  const initialQuestions: QuestionItem[] = event?.questions
    ? event.questions
        .slice()
        .sort((left, right) => left.order - right.order)
        .map((question, index) => ({
          id: question.id,
          label: question.label,
          required: question.required,
          order: question.order ?? index,
        }))
    : [];

  const [questions, setQuestions] = useState<QuestionItem[]>(initialQuestions);

  return (
    <form action={formAction} className="space-y-6">
      <input type="hidden" name="mode" value={mode} />
      {event ? <input type="hidden" name="eventId" value={event.id} /> : null}

      <div className="grid gap-5 md:grid-cols-2">
        <div className="space-y-2">
          <label
            className="block text-xs font-semibold text-slate-600"
            htmlFor="title"
          >
            Title
          </label>
          <InputShell icon={<PencilLine className="h-4 w-4" />}>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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
            className="block text-xs font-semibold text-slate-600"
            htmlFor="venue"
          >
            Venue
          </label>
          <InputShell icon={<MapPin className="h-4 w-4" />}>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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
            className="block text-xs font-semibold text-slate-600"
            htmlFor="locationUrl"
          >
            Maps Link (optional)
          </label>
          <InputShell icon={<MapPin className="h-4 w-4" />}>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="locationUrl"
              name="locationUrl"
              type="url"
              defaultValue={values.locationUrl}
              placeholder="https://maps.google.com/..."
              aria-invalid={Boolean(state?.errors?.locationUrl)}
              aria-describedby={getFieldErrorId(
                "locationUrl",
                state?.errors?.locationUrl,
              )}
            />
          </InputShell>
          <FieldError
            fieldName="locationUrl"
            messages={state?.errors?.locationUrl}
          />
        </div>

        <div className="space-y-2">
          <label
            className="block text-xs font-semibold text-slate-600"
            htmlFor="rewardPoints"
          >
            Reward Points
          </label>
          <InputShell icon={<Trophy className="h-4 w-4" />}>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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
            className="block text-xs font-semibold text-slate-600"
            htmlFor="startsAt"
          >
            Starts At
          </label>
          <InputShell icon={<CalendarRange className="h-4 w-4" />}>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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
            className="block text-xs font-semibold text-slate-600"
            htmlFor="endsAt"
          >
            Ends At
          </label>
          <InputShell icon={<Clock3 className="h-4 w-4" />}>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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
          className="block text-xs font-semibold text-slate-600"
          htmlFor="description"
        >
          Description
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute left-0 top-0 flex items-start pl-3.5 pt-3.5 text-slate-400">
            <FileText className="h-4 w-4" />
          </div>
          <textarea
            className="min-h-32 w-full resize-y rounded border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
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

      <section className="space-y-4 rounded-md border border-slate-200 bg-slate-50/40 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">
            Late-arrival points
          </h2>
        </div>
        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-4">
          <div className="space-y-2">
            <label
              className="block text-xs font-semibold text-slate-600"
              htmlFor="pointGraceMinutes"
            >
              Grace period (minutes)
            </label>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-xs transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="pointGraceMinutes"
              name="pointGraceMinutes"
              type="number"
              min={0}
              max={1440}
              step={1}
              defaultValue={values.pointGraceMinutes}
              aria-invalid={Boolean(state?.errors?.pointGraceMinutes)}
              aria-describedby={getFieldErrorId(
                "pointGraceMinutes",
                state?.errors?.pointGraceMinutes,
              )}
            />
            <FieldError
              fieldName="pointGraceMinutes"
              messages={state?.errors?.pointGraceMinutes}
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-xs font-semibold text-slate-600"
              htmlFor="pointDecayIntervalMinutes"
            >
              Decay interval (minutes)
            </label>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-xs transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="pointDecayIntervalMinutes"
              name="pointDecayIntervalMinutes"
              type="number"
              min={1}
              max={1440}
              step={1}
              defaultValue={values.pointDecayIntervalMinutes}
              aria-invalid={Boolean(state?.errors?.pointDecayIntervalMinutes)}
              aria-describedby={getFieldErrorId(
                "pointDecayIntervalMinutes",
                state?.errors?.pointDecayIntervalMinutes,
              )}
            />
            <FieldError
              fieldName="pointDecayIntervalMinutes"
              messages={state?.errors?.pointDecayIntervalMinutes}
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-xs font-semibold text-slate-600"
              htmlFor="pointDecayPercent"
            >
              Decay per interval (%)
            </label>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-xs transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="pointDecayPercent"
              name="pointDecayPercent"
              type="number"
              min={1}
              max={100}
              step={1}
              defaultValue={values.pointDecayPercent}
              aria-invalid={Boolean(state?.errors?.pointDecayPercent)}
              aria-describedby={getFieldErrorId(
                "pointDecayPercent",
                state?.errors?.pointDecayPercent,
              )}
            />
            <FieldError
              fieldName="pointDecayPercent"
              messages={state?.errors?.pointDecayPercent}
            />
          </div>

          <div className="space-y-2">
            <label
              className="block text-xs font-semibold text-slate-600"
              htmlFor="minimumPoints"
            >
              Minimum points
            </label>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-xs transition focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="minimumPoints"
              name="minimumPoints"
              type="number"
              min={1}
              max={10000}
              step={1}
              defaultValue={values.minimumPoints}
              aria-invalid={Boolean(state?.errors?.minimumPoints)}
              aria-describedby={getFieldErrorId(
                "minimumPoints",
                state?.errors?.minimumPoints,
              )}
            />
            <FieldError
              fieldName="minimumPoints"
              messages={state?.errors?.minimumPoints}
            />
          </div>
        </div>
      </section>

      {/* Additional Questions */}
      <div className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-slate-700">
            Additional Questions
          </p>
          <button
            type="button"
            onClick={() => {
              setQuestions((q) => [
                ...q,
                { label: "", required: false, order: q.length },
              ]);
            }}
            className="inline-flex h-9 items-center gap-2 rounded border border-slate-300 bg-white px-3 text-sm font-semibold text-slate-700 shadow-xs transition hover:bg-slate-50"
          >
            <Plus className="h-4 w-4" />
            Add question
          </button>
        </div>

        <div className="space-y-3 rounded-md border border-slate-200 bg-slate-50/40 p-4">
          {questions.length === 0 ? (
            <p className="text-sm text-slate-400">
              No additional questions configured.
            </p>
          ) : (
            questions.map((q, idx) => (
              <div
                key={q.id ?? `new-${idx}`}
                className="space-y-3 border-b border-slate-200 pb-4 last:border-b-0 last:pb-0"
              >
                <div className="flex items-start gap-3">
                  <div className="flex-1">
                    <label className="block text-xs font-semibold text-slate-600">
                      Question {idx + 1}
                    </label>
                    <input
                      name={`question-label-${idx}`}
                      className="mt-1.5 h-10 w-full rounded border border-slate-300 bg-white px-3 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
                      placeholder="Question label"
                      value={q.label}
                      onChange={(e) => {
                        const label = e.target.value;
                        setQuestions((prev) =>
                          prev.map((p, i) => (i === idx ? { ...p, label } : p)),
                        );
                      }}
                      aria-invalid={Boolean(
                        state?.errors?.[`question-label-${idx}`],
                      )}
                      aria-describedby={getFieldErrorId(
                        `question-label-${idx}`,
                        state?.errors?.[`question-label-${idx}`],
                      )}
                    />
                    <FieldError
                      fieldName={`question-label-${idx}`}
                      messages={state?.errors?.[`question-label-${idx}`]}
                    />
                  </div>

                  <div className="flex flex-col gap-2 items-end">
                    <div className="flex items-center gap-2">
                      <label className="text-xs font-semibold text-slate-500">
                        Required
                      </label>
                      <input
                        type="checkbox"
                        name={`question-required-${idx}`}
                        checked={q.required}
                        onChange={(e) => {
                          const required = e.target.checked;
                          setQuestions((prev) =>
                            prev.map((p, i) =>
                              i === idx ? { ...p, required } : p,
                            ),
                          );
                        }}
                        className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
                      />
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (idx === 0) return;
                          setQuestions((prev) => {
                            const next = prev.slice();
                            const tmp = next[idx - 1];
                            next[idx - 1] = { ...next[idx], order: idx - 1 };
                            next[idx] = { ...tmp, order: idx };
                            return next.map((item, i) => ({
                              ...item,
                              order: i,
                            }));
                          });
                        }}
                        className="rounded p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                        aria-label={`Move question ${idx + 1} up`}
                      >
                        <ArrowUp className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (idx === questions.length - 1) return;
                          setQuestions((prev) => {
                            const next = prev.slice();
                            const tmp = next[idx + 1];
                            next[idx + 1] = { ...next[idx], order: idx + 1 };
                            next[idx] = { ...tmp, order: idx };
                            return next.map((item, i) => ({
                              ...item,
                              order: i,
                            }));
                          });
                        }}
                        className="rounded p-2 text-slate-500 transition hover:bg-slate-200 hover:text-slate-700"
                        aria-label={`Move question ${idx + 1} down`}
                      >
                        <ArrowDown className="h-4 w-4" />
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setQuestions((prev) =>
                            prev
                              .filter((_, i) => i !== idx)
                              .map((it, i) => ({ ...it, order: i })),
                          );
                        }}
                        className="rounded p-2 text-red-700 transition hover:bg-red-50"
                        aria-label={`Remove question ${idx + 1}`}
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M6 18L18 6M6 6l12 12"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}

          <input
            type="hidden"
            name="questions-count"
            value={questions.length}
          />
          {questions.map((q, idx) => (
            <div key={`hidden-${idx}`} className="hidden">
              <input name={`question-label-${idx}`} value={q.label} readOnly />
              {q.required ? (
                <input
                  name={`question-required-${idx}`}
                  value="true"
                  readOnly
                />
              ) : null}
            </div>
          ))}
        </div>
      </div>

      {state?.formError ? (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.formError}</span>
        </div>
      ) : null}

      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
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
