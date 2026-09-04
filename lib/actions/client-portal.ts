"use server";

import { db } from "@/db";
import { pets, owners, vaccines, medicalRecords, users } from "@/db/schema";
import { eq, or, ilike, desc } from "drizzle-orm";

export async function lookupPetCardAction(query: string) {
  const clean = query.trim();
  if (!clean) {
    return { success: false, error: "Por favor ingresa un número de teléfono o código de microchip" };
  }

  try {
    // 1. Try finding by microchip directly
    let foundPets = await db.query.pets.findMany({
      where: ilike(pets.microchip, `%${clean}%`),
      with: {
        owner: true,
        vaccines: {
          orderBy: [desc(vaccines.nextDueDate)],
        },
        medicalRecords: {
          orderBy: [desc(medicalRecords.createdAt)],
          with: {
            vet: true,
          },
        },
      },
    });

    // 2. If not found by microchip, find by owner phone or email
    if (foundPets.length === 0) {
      // Find owners with matching phone or email
      const matchedOwners = await db.query.owners.findMany({
        where: or(
          ilike(owners.phone, `%${clean}%`),
          ilike(owners.whatsapp, `%${clean}%`),
          ilike(owners.email, `%${clean}%`),
          ilike(owners.fullName, `%${clean}%`)
        ),
      });

      if (matchedOwners.length > 0) {
        const ownerIds = matchedOwners.map((o) => o.id);
        const petsByOwner = await Promise.all(
          ownerIds.map((id) =>
            db.query.pets.findMany({
              where: eq(pets.ownerId, id),
              with: {
                owner: true,
                vaccines: {
                  orderBy: [desc(vaccines.nextDueDate)],
                },
                medicalRecords: {
                  orderBy: [desc(medicalRecords.createdAt)],
                  with: {
                    vet: true,
                  },
                },
              },
            })
          )
        );
        foundPets = petsByOwner.flat();
      }
    }

    if (foundPets.length === 0) {
      return {
        success: false,
        error: "No se encontraron mascotas asociadas a ese teléfono o microchip. Verifica los datos o consulta con la clínica.",
      };
    }

    return {
      success: true,
      pets: foundPets,
    };
  } catch (error: any) {
    console.error("Error looking up pet card:", error);
    return { success: false, error: error.message || "Error al buscar la cartilla digital" };
  }
}
