"use server";

import { db } from "@/db";
import { pets, owners, type Pet, type Owner } from "@/db/schema";
import { petSchema, ownerSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";
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

  try {
    const [newOwner] = await db
      .insert(owners)
      .values(parsed.data)
      .returning();

    revalidatePath("/dashboard/mascotas");
    revalidatePath("/dashboard/citas");
    return { success: true, owner: newOwner };
  } catch (error: any) {
    console.error("Error creating owner:", error);
    return { success: false, error: error.message || "No se pudo registrar el propietario" };
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

  try {
    const [newPet] = await db
      .insert(pets)
      .values({
        ownerId: parsed.data.ownerId,
        name: parsed.data.name,
        species: parsed.data.species,
        breed: parsed.data.breed,
        sex: parsed.data.sex,
        birthDate: parsed.data.birthDate || null,
        weightKg: parsed.data.weightKg,
        microchip: parsed.data.microchip || null,
        allergies: parsed.data.allergies || null,
        photoUrl: parsed.data.photoUrl || null,
        notes: parsed.data.notes || null,
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

  try {
    const [updated] = await db
      .update(pets)
      .set({
        ownerId: parsed.data.ownerId,
        name: parsed.data.name,
        species: parsed.data.species,
        breed: parsed.data.breed,
        sex: parsed.data.sex,
        birthDate: parsed.data.birthDate || null,
        weightKg: parsed.data.weightKg,
        microchip: parsed.data.microchip || null,
        allergies: parsed.data.allergies || null,
        photoUrl: parsed.data.photoUrl || null,
        notes: parsed.data.notes || null,
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

