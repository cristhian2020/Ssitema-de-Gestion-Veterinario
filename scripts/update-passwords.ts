import { db } from "../db";
import { users } from "../db/schema";
import { hashPassword } from "../lib/auth/password";
import { eq } from "drizzle-orm";

async function main() {
  console.log("🔒 Actualizando contraseñas de usuarios existentes...");
  const defaultHash = await hashPassword("Huellitas2026!");

  const allUsers = await db.select().from(users);
  console.log(`Encontrados ${allUsers.length} usuarios.`);

  for (const user of allUsers) {
    await db
      .update(users)
      .set({ passwordHash: defaultHash })
      .where(eq(users.id, user.id));
    console.log(`✓ Actualizado ${user.name} (${user.email}) -> Rol: ${user.role}`);
  }

  console.log("🎉 Todas las contraseñas actualizadas a: Huellitas2026!");
  process.exit(0);
}

main().catch((err) => {
  console.error("Error al actualizar contraseñas:", err);
  process.exit(1);
});
