"use client";

import { useActionState } from "react";
import { Mail, Lock, AlertCircle } from "lucide-react";

import { loginAction } from "@/app/login/actions";
import type { LoginFormState } from "@/lib/auth";

const initialState: LoginFormState = undefined;

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

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-6">
      <div className="space-y-2">
        <label
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
          htmlFor="email"
        >
          Email Address
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Mail className="h-4 w-4 text-muted" />
          </div>
          <input
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted/70 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 focus:bg-white"
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            placeholder="admin@example.com"
            aria-invalid={Boolean(state?.errors?.email)}
          />
        </div>
        <FieldError messages={state?.errors?.email} />
      </div>

      <div className="space-y-2">
        <label
          className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block"
          htmlFor="password"
        >
          Password
        </label>
        <div className="relative">
          <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
            <Lock className="h-4 w-4 text-muted" />
          </div>
          <input
            className="w-full rounded-xl border border-border bg-surface pl-10 pr-4 py-3 text-sm text-foreground shadow-xs outline-none transition placeholder:text-muted/70 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/10 focus:bg-white"
            id="password"
            name="password"
            type="password"
            autoComplete="current-password"
            placeholder="••••••••"
            aria-invalid={Boolean(state?.errors?.password)}
          />
        </div>
        <FieldError messages={state?.errors?.password} />
      </div>

      {state?.formError ? (
        <div className="rounded-xl border border-red-100 bg-red-50/50 p-4 text-xs font-medium text-red-600 flex items-center gap-2">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" />
          <span>{state.formError}</span>
        </div>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-xl bg-orange-600 px-4 py-3.5 text-sm font-semibold text-white shadow-md shadow-orange-600/10 transition-all hover:bg-orange-700 hover:shadow-orange-600/20 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-60 disabled:pointer-events-none cursor-pointer"
        type="submit"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
