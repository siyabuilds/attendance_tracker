import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { readAdminSession } from "@/lib/auth";

export default async function AdminPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  if (!session) {
    redirect("/login");
  }

  return (
    <main className="flex flex-1 items-center justify-center p-6 bg-zinc-50/50">
      <div className="text-center max-w-md space-y-4">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
          <svg
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
            />
          </svg>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text">
          Authenticated Dashboard
        </h1>
        <p className="text-sm text-muted">
          Welcome back! You are signed in as{" "}
          <span className="font-semibold text-foreground">{session.email}</span>
          . Use the navigation bar above to log out when done.
        </p>
      </div>
    </main>
  );
}
