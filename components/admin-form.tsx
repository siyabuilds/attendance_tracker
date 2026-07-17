"use client";

import { useActionState, useEffect, useRef } from "react";
import { AlertCircle, Lock, Mail, UserPlus } from "lucide-react";
import { createAdminAction } from "@/app/admin/admins/actions";
import { type AdminFormState } from "@/lib/auth";

const initialState: AdminFormState = undefined;

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

export function AdminForm() {
  const [state, formAction, pending] = useActionState(createAdminAction, initialState);
  const formRef = useRef<HTMLFormElement | null>(null);

  useEffect(() => {
    if (state?.success) {
      formRef.current?.reset();
    }
  }, [state?.success]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <div className="space-y-1">
        <h3 className="text-base font-bold text-slate-900">Create administrator</h3>
        <p className="text-xs text-slate-500">Add a new admin. Emails must end with @umuzi.org.</p>
      </div>

      <div className="space-y-4">
        {/* Email Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600" htmlFor="email">
            Email Address
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Mail className="h-4 w-4" />
            </div>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="email"
              name="email"
              type="email"
              required
              placeholder="name@umuzi.org"
              aria-invalid={Boolean(state?.errors?.email)}
              aria-describedby={getFieldErrorId("email", state?.errors?.email)}
            />
          </div>
          <FieldError fieldName="email" messages={state?.errors?.email} />
        </div>

        {/* Password Field */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-600" htmlFor="password">
            Password
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-slate-400">
              <Lock className="h-4 w-4" />
            </div>
            <input
              className="h-11 w-full rounded border border-slate-300 bg-white py-2 pl-10 pr-4 text-sm text-slate-800 shadow-xs transition placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
              id="password"
              name="password"
              type="password"
              required
              placeholder="••••••••"
              aria-invalid={Boolean(state?.errors?.password)}
              aria-describedby={getFieldErrorId("password", state?.errors?.password)}
            />
          </div>
          <FieldError fieldName="password" messages={state?.errors?.password} />
        </div>

        {/* Superuser Checkbox */}
        <div className="flex items-start gap-3 rounded-lg border border-slate-200 bg-slate-50/50 p-4">
          <div className="flex h-5 items-center">
            <input
              id="isSuperuser"
              name="isSuperuser"
              type="checkbox"
              className="h-4 w-4 rounded border-slate-300 text-orange-600 focus:ring-orange-500"
            />
          </div>
          <div className="text-xs">
            <label htmlFor="isSuperuser" className="font-bold text-slate-700 block cursor-pointer">
              Superuser privileges
            </label>
            <span className="text-slate-500 mt-0.5 block">
              Superusers can manage other administrator accounts, including creating and deleting them.
            </span>
          </div>
        </div>
      </div>

      {state?.formError ? (
        <div className="flex items-center gap-2 rounded border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
          <AlertCircle className="h-4 w-4 shrink-0" />
          <span>{state.formError}</span>
        </div>
      ) : null}

      {state?.success ? (
        <div className="flex items-center gap-2 rounded border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">
          <svg className="h-4 w-4 shrink-0 text-emerald-700" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          <span>Administrator created successfully!</span>
        </div>
      ) : null}

      <button
        className="inline-flex h-11 w-full items-center justify-center gap-2 rounded bg-orange-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-orange-700 hover:shadow-md active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        <UserPlus className="h-4 w-4" />
        {pending ? "Creating..." : "Create administrator"}
      </button>
    </form>
  );
}
