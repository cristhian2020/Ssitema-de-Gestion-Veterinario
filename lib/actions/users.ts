"use server";

import { db } from "@/db";
import { users, type User } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { hashPassword } from "@/lib/auth/password";
import { getSession } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function getStaffUsersAction(): Promise<User[]> {
  try {
    return await db.query.users.findMany({
      orderBy: [desc(users.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching staff users:", error);
    return [];
  }
}

export async function createStaffUserAction(data: {
  name: string;
  email: string;
  password: string;
  role: "admin" | "vet" | "receptionist";
  specialty?: string;
  phone?: string;
}) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return {
      success: false,
      error: "Acceso denegado: Solo el Administrador / Director puede registrar nuevo personal",
    };
  }

  const name = data.name?.trim();
  const email = data.email?.trim().toLowerCase();
  const password = data.password?.trim();

  if (!name || !email || !password) {
    return { success: false, error: "Nombre, correo y contraseña son obligatorios" };
  }
  if (password.length < 6) {
    return { success: false, error: "La contraseña debe tener al menos 6 caracteres" };
  }

  try {
    // Check if email already exists
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existing) {
      return { success: false, error: "Ya existe un colaborador registrado con este correo electrónico" };
    }

    const passwordHash = await hashPassword(password);

    const [newUser] = await db
      .insert(users)
      .values({
        name,
        email,
        passwordHash,
        role: data.role,
        specialty: data.specialty?.trim() || null,
        phone: data.phone?.trim() || null,
        active: true,
      })
      .returning();

    revalidatePath("/dashboard/personal");
    return { success: true, user: newUser };
  } catch (error: any) {
    console.error("Error creating staff user:", error);
    return { success: false, error: error.message || "Error al registrar nuevo personal" };
  }
}

export async function resetUserPasswordAction(userId: number, newPassword: string) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return {
      success: false,
      error: "Acceso denegado: Solo el Director / Admin puede restablecer contraseñas",
    };
  }

  if (!newPassword || newPassword.trim().length < 6) {
    return { success: false, error: "La nueva contraseña debe tener al menos 6 caracteres" };
  }

  try {
    const passwordHash = await hashPassword(newPassword.trim());
    await db
      .update(users)
      .set({ passwordHash })
      .where(eq(users.id, userId));

    revalidatePath("/dashboard/personal");
    return { success: true };
  } catch (error: any) {
    console.error("Error resetting password:", error);
    return { success: false, error: error.message || "No se pudo actualizar la contraseña" };
  }
}

export async function toggleUserStatusAction(userId: number, currentActive: boolean) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return {
      success: false,
      error: "Acceso denegado: Solo el Director / Admin puede alterar el estado de las cuentas",
    };
  }

  // Prevent admin from deactivating themselves
  if (Number(session.id) === userId) {
    return { success: false, error: "No puedes desactivar tu propia cuenta administradora" };
  }

  try {
    const [updated] = await db
      .update(users)
      .set({ active: !currentActive })
      .where(eq(users.id, userId))
      .returning();

    revalidatePath("/dashboard/personal");
    return { success: true, active: updated.active };
  } catch (error: any) {
    console.error("Error toggling user status:", error);
    return { success: false, error: error.message || "Error al cambiar estado" };
  }
}
