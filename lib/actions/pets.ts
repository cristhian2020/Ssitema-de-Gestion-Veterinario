"use server";

import { db } from "@/db";
import { pets, owners, type Pet, type Owner } from "@/db/schema";
import { petSchema, ownerSchema } from "@/lib/validations";
import { eq, desc, and, or, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type PetWithOwner = Pet & {
  owner: Owner;
};

export async function getPetsAction(): Promise<PetWithOwner[]> {
  try {
    const records = await db.query.pets.findMany({
      with: {
        owner: true,
      },
      orderBy: [desc(pets.createdAt)],
    });
    return records as PetWithOwner[];
  } catch (error) {
    console.error("Error fetching pets:", error);
    return [];
  }
}

export async function getOwnersAction(): Promise<Owner[]> {
  try {
    return await db.query.owners.findMany({
      orderBy: [desc(owners.createdAt)],
    });
  } catch (error) {
    console.error("Error fetching owners:", error);
    return [];
  }
}

export async function createOwnerAction(data: unknown) {
  const parsed = ownerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos del propietario inválidos",
    };
  }

  const cleanEmail = parsed.data.email.trim().toLowerCase();
  const cleanPhone = parsed.data.phone.trim();

  try {
    // Validar si ya existe un propietario con el mismo correo o teléfono
    const existingOwner = await db.query.owners.findFirst({
      where: or(eq(owners.email, cleanEmail), eq(owners.phone, cleanPhone)),
    });

    if (existingOwner) {
      const matchReason =
        existingOwner.email.toLowerCase() === cleanEmail
          ? "correo electrónico"
          : "número de teléfono";
      return {
        success: false,
        error: `Ya existe un propietario registrado con este ${matchReason}: "${existingOwner.fullName}". Puedes seleccionarlo directamente desde la lista de dueños.`,
      };
    }

    const [newOwner] = await db
      .insert(owners)
      .values({
        fullName: parsed.data.fullName.trim(),
        email: cleanEmail,
        phone: cleanPhone,
        whatsapp: parsed.data.whatsapp || cleanPhone,
        documentId: parsed.data.documentId || null,
        address: parsed.data.address || null,
        city: parsed.data.city || null,
        notes: parsed.data.notes || null,
      })
      .returning();

    revalidatePath("/dashboard/mascotas");
    revalidatePath("/dashboard/citas");
    return { success: true, owner: newOwner };
  } catch (error: any) {
    console.error("Error creating owner:", error);
    return { success: false, error: error.message || "No se pudo registrar el propietario" };
  }
}

export async function updateOwnerAction(ownerId: number, data: unknown) {
  const parsed = ownerSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos del propietario inválidos",
    };
  }

  const cleanEmail = parsed.data.email.trim().toLowerCase();
  const cleanPhone = parsed.data.phone.trim();

  try {
    // Validar que no haya OTRO propietario con ese mismo email o teléfono
    const duplicateOwner = await db.query.owners.findFirst({
      where: and(
        ne(owners.id, ownerId),
        or(eq(owners.email, cleanEmail), eq(owners.phone, cleanPhone))
      ),
    });

    if (duplicateOwner) {
      const matchReason =
        duplicateOwner.email.toLowerCase() === cleanEmail
          ? "correo electrónico"
          : "número de teléfono";
      return {
        success: false,
        error: `El ${matchReason} ingresado ya está asignado a otro propietario registrado ("${duplicateOwner.fullName}").`,
      };
    }

    const [updated] = await db
      .update(owners)
      .set({
        fullName: parsed.data.fullName.trim(),
        documentId: parsed.data.documentId || null,
        email: cleanEmail,
        phone: cleanPhone,
        whatsapp: parsed.data.whatsapp || cleanPhone,
        address: parsed.data.address || null,
        city: parsed.data.city || null,
        notes: parsed.data.notes || null,
      })
      .where(eq(owners.id, ownerId))
      .returning();

    revalidatePath("/dashboard/mascotas");
    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard/historial");
    return { success: true, owner: updated };
  } catch (error: any) {
    console.error("Error updating owner:", error);
    return { success: false, error: error.message || "No se pudo actualizar el propietario" };
  }
}

export async function createPetAction(data: unknown) {
  const parsed = petSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de la mascota inválidos",
    };
  }

  const cleanChip = parsed.data.microchip?.trim();

  try {
    // Validar microchip único si fue provisto
    if (cleanChip) {
      const existingPet = await db.query.pets.findFirst({
        where: eq(pets.microchip, cleanChip),
        with: { owner: true },
      });

      if (existingPet) {
        return {
          success: false,
          error: `El microchip ISO "${cleanChip}" ya está asignado a la mascota "${existingPet.name}" (Tutor: ${existingPet.owner?.fullName || "registrado"}). Los microchips deben ser únicos.`,
        };
      }
    }

    const [newPet] = await db
      .insert(pets)
      .values({
        ownerId: parsed.data.ownerId,
        name: parsed.data.name.trim(),
        species: parsed.data.species,
        breed: parsed.data.breed.trim(),
        sex: parsed.data.sex,
        birthDate: parsed.data.birthDate || null,
        weightKg: parsed.data.weightKg,
        microchip: cleanChip || null,
        allergies: parsed.data.allergies?.trim() || null,
        photoUrl: parsed.data.photoUrl || null,
        notes: parsed.data.notes?.trim() || null,
      })
      .returning();

    revalidatePath("/dashboard/mascotas");
    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard/historial");
    return { success: true, pet: newPet };
  } catch (error: any) {
    console.error("Error creating pet:", error);
    return { success: false, error: error.message || "No se pudo registrar la mascota" };
  }
}

export async function updatePetAction(petId: number, data: unknown) {
  const parsed = petSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de la mascota inválidos",
    };
  }

  const cleanChip = parsed.data.microchip?.trim();

  try {
    // Validar microchip único contra otras mascotas
    if (cleanChip) {
      const duplicatePet = await db.query.pets.findFirst({
        where: and(ne(pets.id, petId), eq(pets.microchip, cleanChip)),
        with: { owner: true },
      });

      if (duplicatePet) {
        return {
          success: false,
          error: `El microchip ISO "${cleanChip}" ya está en uso por otra mascota ("${duplicatePet.name}").`,
        };
      }
    }

    const [updated] = await db
      .update(pets)
      .set({
        ownerId: parsed.data.ownerId,
        name: parsed.data.name.trim(),
        species: parsed.data.species,
        breed: parsed.data.breed.trim(),
        sex: parsed.data.sex,
        birthDate: parsed.data.birthDate || null,
        weightKg: parsed.data.weightKg,
        microchip: cleanChip || null,
        allergies: parsed.data.allergies?.trim() || null,
        photoUrl: parsed.data.photoUrl || null,
        notes: parsed.data.notes?.trim() || null,
      })
      .where(eq(pets.id, petId))
      .returning();

    revalidatePath("/dashboard/mascotas");
    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard/historial");
    return { success: true, pet: updated };
  } catch (error: any) {
    console.error("Error updating pet:", error);
    return { success: false, error: error.message || "No se pudo actualizar la mascota" };
  }
}

import { getSession } from "@/lib/auth/session";

export async function deletePetAction(petId: number) {
  const session = await getSession();
  if (session && session.role !== "admin") {
    return {
      success: false,
      error: "Acceso denegado: Solo el Administrador / Director puede dar de baja definitiva a un paciente",
    };
  }

  try {
    await db.delete(pets).where(eq(pets.id, petId));
    revalidatePath("/dashboard/mascotas");
    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard/historial");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting pet:", error);
    return { success: false, error: error.message || "No se pudo eliminar el registro de la mascota" };
  }
}


