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
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-zinc-50/50">
      <div className="w-full max-w-md space-y-8 bg-surface p-8 sm:p-10 rounded-2xl border border-border shadow-xs">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-foreground bg-gradient-to-r from-zinc-900 to-zinc-700 bg-clip-text">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-muted">
            Enter your admin credentials to access the dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
