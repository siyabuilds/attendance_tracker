"use server";

import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/prisma";
import {
  adminSessionCookieName,
  adminSessionCookieOptions,
  createAdminSessionCookieValue,
  loginSchema,
  type LoginFormState,
} from "@/lib/auth";

export async function loginAction(
  _state: LoginFormState,
  formData: FormData,
): Promise<LoginFormState> {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      formError: "Check the highlighted fields and try again.",
    };
  }

  const admin = await prisma.admin.findUnique({
    where: {
      email: parsed.data.email,
    },
  });

  if (!admin) {
    return {
      formError: "Invalid email or password.",
    };
  }

  const passwordMatches = await bcrypt.compare(
    parsed.data.password,
    admin.password,
  );

  if (!passwordMatches) {
    return {
      formError: "Invalid email or password.",
    };
  }

  const cookieStore = await cookies();
  const sessionValue = await createAdminSessionCookieValue({
    adminId: admin.id,
    email: admin.email,
  });

  cookieStore.set(
    adminSessionCookieName,
    sessionValue,
    adminSessionCookieOptions(),
  );
  redirect("/admin");
}

export async function logoutAction() {
  const cookieStore = await cookies();
  cookieStore.delete(adminSessionCookieName);
  redirect("/login");
}
