import { cookies } from "next/headers";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronLeft, Shield, Trash2, Users, UsersRound } from "lucide-react";

import { deleteAdminAction } from "@/app/admin/admins/actions";
import { AdminForm } from "@/components/admin-form";
import { readAdminSession } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export default async function AdminManagementPage() {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);

  if (!session) {
    redirect("/login");
  }

  const currentAdmin = await prisma.admin.findUnique({
    where: { id: session.adminId },
  });

  if (!currentAdmin || !currentAdmin.isSuperuser) {
    redirect("/admin");
  }

  const admins = await prisma.admin.findMany({
    orderBy: {
      email: "asc",
    },
  });

  const superuserCount = admins.filter((admin) => admin.isSuperuser).length;
  const regularAdminCount = admins.length - superuserCount;

  return (
    <main className="flex-1 px-4 py-8 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl space-y-6">
        {/* Header Block */}
        <section className="overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-col gap-6 border-b border-slate-100 bg-gradient-to-br from-slate-50 via-white to-orange-50/20 px-6 py-7 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-2">
              <Link
                className="inline-flex items-center gap-1 text-sm font-semibold text-slate-500 transition-colors hover:text-orange-600 mb-1"
                href="/admin"
              >
                <ChevronLeft className="h-4 w-4" />
                Back to dashboard
              </Link>
              <p className="text-xs font-semibold text-orange-700">
                System Administration
              </p>
              <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
                Admin management
              </h1>
              <p className="text-sm text-slate-500">
                Create and delete administrator accounts, and control system-wide superuser privileges.
              </p>
            </div>

            <div className="inline-flex items-center gap-2 rounded border border-orange-200 bg-orange-50 px-3 py-2 text-sm font-semibold text-orange-700">
              <Shield className="h-4 w-4" />
              Superuser access
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid gap-4 px-6 py-5 sm:grid-cols-3">
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50">
              <p className="text-xs font-semibold text-slate-500">
                Total Administrators
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {admins.length}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50">
              <p className="text-xs font-semibold text-slate-500">
                Superusers
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {superuserCount}
              </p>
            </div>
            <div className="rounded-md border border-slate-200 bg-slate-50/50 p-5 transition hover:bg-slate-50">
              <p className="text-xs font-semibold text-slate-500">
                Regular Admins
              </p>
              <p className="mt-2 text-3xl font-extrabold tracking-tight text-slate-900">
                {regularAdminCount}
              </p>
            </div>
          </div>
        </section>

        {/* Content Workspace */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Administrators Table Card */}
          <div className="lg:col-span-2 overflow-hidden rounded-md border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-6 py-5">
              <h2 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                <UsersRound className="h-5 w-5 text-orange-600" />
                Active administrators
              </h2>
              <p className="text-sm text-slate-500">
                Administrators configured in the database.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full border-collapse text-left text-sm text-slate-850">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                    <th className="px-6 py-4">Administrator</th>
                    <th className="px-6 py-4">Privileges</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {admins.map((admin) => {
                    const isCurrentUser = admin.id === currentAdmin.id;
                    const isLastSuperuser = admin.isSuperuser && superuserCount <= 1;
                    const canDelete = !isCurrentUser && !isLastSuperuser;

                    const initials = admin.email
                      .split("@")[0]
                      .slice(0, 2)
                      .toUpperCase();

                    return (
                      <tr
                        key={admin.id}
                        className="transition-colors hover:bg-orange-50/30"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center gap-3">
                            <div className="flex h-9 w-9 items-center justify-center rounded border border-orange-200 bg-orange-50 text-xs font-bold text-orange-700 shadow-xs">
                              {initials || <Users className="h-3.5 w-3.5" />}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 flex items-center gap-1.5">
                                {admin.email}
                                {isCurrentUser && (
                                  <span className="rounded bg-orange-100 px-1.5 py-0.5 text-[10px] font-bold text-orange-700">
                                    You
                                  </span>
                                )}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {admin.isSuperuser ? (
                            <span className="inline-flex items-center gap-1 rounded bg-amber-50 border border-amber-200 px-2 py-0.5 text-xs font-semibold text-amber-800">
                              <Shield className="h-3 w-3 shrink-0" />
                              Superuser
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 rounded bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-700">
                              Admin
                            </span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right">
                          {canDelete ? (
                            <form action={deleteAdminAction} className="inline-block m-0">
                              <input
                                type="hidden"
                                name="adminId"
                                value={admin.id}
                              />
                              <button
                                className="inline-flex h-9 items-center gap-1.5 rounded border border-red-250 bg-red-50 px-3 text-sm font-semibold text-red-700 transition hover:border-red-300 hover:bg-red-100 active:scale-[0.98]"
                                type="submit"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                                Delete
                              </button>
                            </form>
                          ) : (
                            <button
                              disabled
                              className="inline-flex h-9 items-center gap-1.5 rounded border border-slate-200 bg-slate-50 px-3 text-sm font-semibold text-slate-400 cursor-not-allowed opacity-60"
                              title={
                                isCurrentUser
                                  ? "You cannot delete your own account."
                                  : "Cannot delete the last remaining Superuser."
                              }
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                              Delete
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Creation Form Card */}
          <section className="rounded-md border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
            <AdminForm />
          </section>
        </div>
      </div>
    </main>
  );
}
