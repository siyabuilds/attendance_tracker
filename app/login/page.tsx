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
    <main className="flex flex-1 items-center justify-center px-4 py-12 sm:px-6 lg:px-8 bg-slate-50/30">
      <div className="w-full max-w-md space-y-8 bg-white p-8 sm:p-10 rounded-2xl border border-slate-100 shadow-sm">
        <div className="text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Sign In
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            Enter your admin credentials to access the dashboard
          </p>
        </div>
        <LoginForm />
      </div>
    </main>
  );
}
