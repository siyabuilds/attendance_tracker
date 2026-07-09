import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { LoginForm } from "@/app/login/login-form";
import { readAdminSession } from "@/lib/auth";

export default async function LoginPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  if (session) {
    redirect("/admin");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <section className="grid w-full max-w-5xl overflow-hidden rounded-md border border-orange-400 bg-surface shadow-sm lg:grid-cols-[1.1fr_0.9fr]">
        <div className="relative overflow-hidden bg-orange-600 px-8 py-12 text-white sm:px-12 lg:px-14 lg:py-16">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,247,237,0.22),transparent_28%),radial-gradient(circle_at_bottom_left,rgba(255,255,255,0.14),transparent_26%)]" />
          <div className="relative flex h-full flex-col justify-between gap-12">
            <div className="space-y-6">
              <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-100">
                Admin access
              </p>
              <h1 className="max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
                Sign in to the attendance dashboard.
              </h1>
              <p className="max-w-lg text-base leading-7 text-orange-100 sm:text-lg">
                Use the seeded admin account to access the attendance dashboard.
                Your session stays active across page refreshes until you sign
                out.
              </p>
            </div>

            <div className="grid gap-4 text-sm text-orange-50 sm:grid-cols-3">
              <div className="rounded-sm border border-orange-200 bg-white/10 p-4">
                <p className="text-orange-100">Step 1</p>
                <p className="mt-1 font-medium">
                  Verify the administrator's email and password before granting
                  access.
                </p>
              </div>
              <div className="rounded-sm border border-orange-200 bg-white/10 p-4">
                <p className="text-orange-100">Step 2</p>
                <p className="mt-1 font-medium">Create a session</p>
              </div>
              <div className="rounded-sm border border-orange-200 bg-white/10 p-4">
                <p className="text-orange-100">Step 3</p>
                <p className="mt-1 font-medium">
                  Access the protected attendance dashboard after successful
                  authentication.
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="px-8 py-12 sm:px-12 lg:px-14 lg:py-16">
          <div className="mx-auto max-w-md">
            <div className="mb-8 space-y-3">
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-muted">
                Welcome back
              </p>
              <h2 className="text-3xl font-semibold tracking-tight text-foreground">
                Sign in using the seeded administrator account.
              </h2>
              <p className="text-sm leading-6 text-muted">
                Your credentials are securely verified before you're signed in
                and redirected to the dashboard.
              </p>
            </div>

            <LoginForm />
          </div>
        </div>
      </section>
    </main>
  );
}
