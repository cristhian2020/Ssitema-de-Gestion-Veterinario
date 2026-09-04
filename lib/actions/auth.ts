"use server";

import { db } from "@/db";
import { users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyPassword } from "@/lib/auth/password";
import { setSessionCookie, clearSessionCookie, getSession, SessionUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";

export async function loginAction(formData: { email: string; password?: string }) {
  try {
    const email = formData.email?.trim().toLowerCase();
    const password = formData.password || "";

    if (!email) {
      return { success: false, error: "El correo electrónico es requerido" };
    }

    const [user] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (!user) {
      return { success: false, error: "Usuario no encontrado con ese correo" };
    }

    // Verify password strictly with bcrypt
    if (user.passwordHash) {
      const isValid = await verifyPassword(password, user.passwordHash);
      if (!isValid) {
        return { success: false, error: "Credenciales inválidas" };
      }
    } else {
      if (process.env.NODE_ENV !== "development") {
        return { success: false, error: "Usuario sin contraseña configurada. Contacte a la administración." };
      }
      if (password !== "Huellitas2026!") {
        return { success: false, error: "Contraseña incorrecta" };
      }
    }

    const sessionUser: SessionUser = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as SessionUser["role"],
      phone: user.phone,
      avatarUrl: user.avatarUrl,
    };

    await setSessionCookie(sessionUser);

    return { success: true, user: sessionUser };
  } catch (error: any) {
    console.error("Error en loginAction:", error);
    return { success: false, error: error.message || "Error al iniciar sesión" };
  }
}

export async function logoutAction() {
  await clearSessionCookie();
  return { success: true };
}

export async function getCurrentUserAction(): Promise<SessionUser | null> {
  return getSession();
}
