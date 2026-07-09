"use client";

import { useActionState } from "react";

import { loginAction } from "@/app/login/actions";
import type { LoginFormState } from "@/lib/auth";

const initialState: LoginFormState = undefined;

function FieldError({ messages }: { messages?: string[] }) {
  if (!messages?.length) {
    return null;
  }

  return <p className="mt-2 text-sm text-orange-800">{messages[0]}</p>;
}

export function LoginForm() {
  const [state, formAction, pending] = useActionState(
    loginAction,
    initialState,
  );

  return (
    <form action={formAction} className="space-y-5">
      <div>
        <label
          className="mb-2 block text-sm font-medium text-foreground"
          htmlFor="email"
        >
          Email
        </label>
        <input
          className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          id="email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="admin@example.com"
          aria-invalid={Boolean(state?.errors?.email)}
        />
        <FieldError messages={state?.errors?.email} />
      </div>

      <div>
        <label
          className="mb-2 block text-sm font-medium text-foreground"
          htmlFor="password"
        >
          Password
        </label>
        <input
          className="w-full rounded-sm border border-border bg-surface px-4 py-3 text-foreground shadow-sm outline-none transition placeholder:text-muted focus:border-orange-500 focus:ring-4 focus:ring-orange-100"
          id="password"
          name="password"
          type="password"
          autoComplete="current-password"
          placeholder="Your admin password"
          aria-invalid={Boolean(state?.errors?.password)}
        />
        <FieldError messages={state?.errors?.password} />
      </div>

      {state?.formError ? (
        <p className="rounded-sm border border-orange-200 bg-orange-50 px-4 py-3 text-sm text-orange-900">
          {state.formError}
        </p>
      ) : null}

      <button
        className="inline-flex w-full items-center justify-center rounded-sm bg-orange-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-orange-700 disabled:cursor-not-allowed disabled:opacity-60"
        type="submit"
        disabled={pending}
      >
        {pending ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}
