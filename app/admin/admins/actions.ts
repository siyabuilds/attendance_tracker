"use server";

import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { adminCreateSchema, readAdminSession, type AdminFormState } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function createAdminAction(
  _state: AdminFormState,
  formData: FormData,
): Promise<AdminFormState> {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);
  if (!session) {
    return { formError: "You must be logged in to perform this action." };
  }

  const currentAdmin = await prisma.admin.findUnique({
    where: { id: session.adminId },
  });

  if (!currentAdmin || !currentAdmin.isSuperuser) {
    return { formError: "Unauthorized. Only Superusers can manage admin accounts." };
  }

  const isSuperuser = formData.get("isSuperuser") === "true" || formData.get("isSuperuser") === "on";
  const parsed = adminCreateSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    isSuperuser,
  });

  if (!parsed.success) {
    return {
      errors: parsed.error.flatten().fieldErrors,
      formError: "Check the highlighted fields and try again.",
    };
  }

  const existingAdmin = await prisma.admin.findUnique({
    where: { email: parsed.data.email },
  });

  if (existingAdmin) {
    return {
      errors: {
        email: ["An administrator with this email already exists."],
      },
      formError: "Check the highlighted fields and try again.",
    };
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(parsed.data.password, 10);
  } catch (error) {
    console.error("Hashing error:", error);
    return { formError: "An error occurred while creating the account." };
  }

  try {
    await prisma.admin.create({
      data: {
        email: parsed.data.email,
        password: hashedPassword,
        isSuperuser: parsed.data.isSuperuser,
      },
    });
  } catch (error) {
    console.error("Database error creating admin:", error);
    return { formError: "Failed to create administrator account. Please try again." };
  }

  revalidatePath("/admin/admins");
  return { success: true };
}

export async function deleteAdminAction(formData: FormData) {
  const cookieStore = await cookies();
  const session = await readAdminSession(cookieStore);
  if (!session) {
    throw new Error("Unauthorized");
  }

  const currentAdmin = await prisma.admin.findUnique({
    where: { id: session.adminId },
  });

  if (!currentAdmin || !currentAdmin.isSuperuser) {
    throw new Error("Unauthorized");
  }

  const adminIdToDelete = formData.get("adminId")?.toString();
  if (!adminIdToDelete) {
    throw new Error("Missing admin ID to delete");
  }

  if (adminIdToDelete === currentAdmin.id) {
    throw new Error("Superusers cannot delete themselves.");
  }

  const adminToDelete = await prisma.admin.findUnique({
    where: { id: adminIdToDelete },
  });

  if (!adminToDelete) {
    throw new Error("Admin not found.");
  }

  if (adminToDelete.isSuperuser) {
    const superuserCount = await prisma.admin.count({
      where: { isSuperuser: true },
    });
    if (superuserCount <= 1) {
      throw new Error("Cannot delete the last remaining Superuser.");
    }
  }

  try {
    await prisma.admin.delete({
      where: { id: adminIdToDelete },
    });
  } catch (error) {
    console.error("Error deleting admin:", error);
    throw new Error("Failed to delete admin.");
  }

  revalidatePath("/admin/admins");
  redirect("/admin/admins");
}
