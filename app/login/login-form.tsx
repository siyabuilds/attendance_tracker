"use client";

import { useActionState } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";

import { loginAction } from "@/app/login/actions";
import type { LoginFormState } from "@/lib/auth";

const initialState: LoginFormState = undefined;

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

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label
          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block"
          htmlFor="email"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Mail className="h-4 w-4 text-slate-400" />
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            aria-invalid={Boolean(state?.errors?.email)}
            aria-describedby={getFieldErrorId("email", state?.errors?.email)}
          />
        </div>
        <FieldError fieldName="email" messages={state?.errors?.email} />
      </div>

      <div className="space-y-2">
        <label
          className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5">
            <Lock className="h-4 w-4 text-slate-400" />
          </div>
          <input
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-3 text-sm text-slate-800 shadow-xs outline-none transition-all placeholder:text-slate-400 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(state?.errors?.password)}
            aria-describedby={getFieldErrorId(
              "password",
              state?.errors?.password,
            )}
          />
        </div>
        <FieldError fieldName="password" messages={state?.errors?.password} />
      </div>

      {state?.formError ? (
        <div className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-xs font-bold text-red-700 flex items-center gap-2 shadow-xs">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-650" />
          <span>{state.formError}</span>
        </div>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-4.5 py-3 text-sm font-semibold text-white shadow-md shadow-orange-600/15 transition-all hover:bg-orange-500 hover:shadow-lg hover:shadow-orange-600/25 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        type="submit"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
