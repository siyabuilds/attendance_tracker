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
    <main className="flex flex-1 items-center justify-center bg-slate-50/40 px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
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
