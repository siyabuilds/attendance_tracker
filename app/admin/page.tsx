import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { logoutAction } from "@/app/login/actions";
import { readAdminSession } from "@/lib/auth";

function formatEmailForDisplay(email: string) {
  const [localPart, domainPart] = email.split("@");

  if (!domainPart || localPart.length <= 15) {
    return email;
  }

  return `${localPart.slice(0, 15)}…@${domainPart}`;
}

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex min-h-screen items-center justify-center px-4 py-10 text-foreground sm:px-6 lg:px-8">
      <section className="w-full border-orange-400 max-w-5xl overflow-hidden rounded-md border border-border bg-surface shadow-sm">
        <div className=" border-orange-700 bg-orange-600 px-8 py-8 text-white sm:px-12 lg:px-14">
          <p className="text-sm font-semibold uppercase tracking-[0.3em] text-orange-100">
            Protected area
          </p>
          <div className="mt-4 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <h1 className="text-4xl font-semibold tracking-tight sm:text-5xl">
                Admin dashboard
              </h1>
              <p className="mt-3 max-w-2xl text-base leading-7 text-orange-100 sm:text-lg">
                You are signed in and can refresh this page without losing
                access until the session expires or you log out.
              </p>
            </div>

            <form action={logoutAction}>
              <button
                type="submit"
                className="inline-flex items-center justify-center rounded-sm border border-orange-200 bg-white px-4 py-3 text-sm font-semibold text-orange-700 transition hover:bg-orange-50"
              >
                Log out
              </button>
            </form>
          </div>
        </div>

        <div className="grid gap-6 px-8 py-8 sm:px-12 lg:grid-cols-3 lg:px-14">
          <div className="rounded-md border border-border bg-orange-50 p-6">
            <p className="text-sm font-medium text-muted">Signed in as</p>
            <p
              className="mt-3 truncate text-lg font-semibold text-foreground"
              title={session.email}
            >
              {session.email}
            </p>
          </div>

          <div className="rounded-md border border-border bg-orange-50 p-6">
            <p className="text-sm font-medium text-muted">Session status</p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              Active and protected
            </p>
          </div>

          <div className="rounded-md border border-border bg-orange-50 p-6">
            <p className="text-sm font-medium text-muted">Access control</p>
            <p className="mt-3 text-lg font-semibold text-foreground">
              Middleware enforced
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
