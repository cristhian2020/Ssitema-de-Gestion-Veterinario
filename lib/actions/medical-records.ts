"use server";

import { db } from "@/db";
import {
  medicalRecords,
  vaccines,
  pets,
  users,
  type MedicalRecord,
  type Vaccine,
  type Pet,
  type User,
} from "@/db/schema";
import { medicalRecordSchema, vaccineSchema } from "@/lib/validations";
import { eq, desc } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type MedicalRecordWithDetails = MedicalRecord & {
  pet: Pet;
  vet?: User | null;
};

export type VaccineWithPet = Vaccine & {
  pet: Pet;
};

export async function getMedicalRecordsAction(petId?: number): Promise<MedicalRecordWithDetails[]> {
  try {
    const records = await db.query.medicalRecords.findMany({
      where: petId ? eq(medicalRecords.petId, petId) : undefined,
      with: {
        pet: true,
        vet: true,
      },
      orderBy: [desc(medicalRecords.createdAt)],
    });
    return records as MedicalRecordWithDetails[];
  } catch (error) {
    console.error("Error fetching medical records:", error);
    return [];
  }
}

export async function getVaccinesAction(petId?: number): Promise<VaccineWithPet[]> {
  try {
    const records = await db.query.vaccines.findMany({
      where: petId ? eq(vaccines.petId, petId) : undefined,
      with: {
        pet: true,
      },
      orderBy: [desc(vaccines.nextDueDate)],
    });
    return records as VaccineWithPet[];
  } catch (error) {
    console.error("Error fetching vaccines:", error);
    return [];
  }
}

export async function createMedicalRecordAction(data: unknown) {
  const parsed = medicalRecordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos del historial clínico inválidos",
    };
  }

  try {
    const [newRecord] = await db
      .insert(medicalRecords)
      .values({
        petId: parsed.data.petId,
        vetId: parsed.data.vetId || null,
        appointmentId: parsed.data.appointmentId || null,
        reason: parsed.data.reason,
        symptoms: parsed.data.symptoms,
        diagnosis: parsed.data.diagnosis,
        treatment: parsed.data.treatment,
        prescription: parsed.data.prescription || null,
        weightKg: parsed.data.weightKg || null,
        temperatureC: parsed.data.temperatureC || null,
        internalNotes: parsed.data.internalNotes || null,
      })
      .returning();

    // Actualizar también el peso de la mascota si se registró uno nuevo
    if (parsed.data.weightKg) {
      await db
        .update(pets)
        .set({ weightKg: parsed.data.weightKg })
        .where(eq(pets.id, parsed.data.petId));
    }

    revalidatePath("/dashboard/historial");
    revalidatePath("/dashboard/mascotas");
    return { success: true, record: newRecord };
  } catch (error: any) {
    console.error("Error creating medical record:", error);
    return { success: false, error: error.message || "Error al registrar la consulta médica" };
  }
}

export async function createVaccineAction(data: unknown) {
  const parsed = vaccineSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de vacunación inválidos",
    };
  }

  try {
    const [newVaccine] = await db
      .insert(vaccines)
      .values({
        petId: parsed.data.petId,
        name: parsed.data.name,
        type: parsed.data.type,
        dose: parsed.data.dose,
        batchNumber: parsed.data.batchNumber || null,
        appliedAt: parsed.data.appliedAt ? new Date(parsed.data.appliedAt) : null,
        nextDueDate: new Date(parsed.data.nextDueDate),
        status: parsed.data.status,
        vetNotes: parsed.data.vetNotes || null,
      })
      .returning();

    revalidatePath("/dashboard/historial");
    return { success: true, vaccine: newVaccine };
  } catch (error: any) {
    console.error("Error creating vaccine entry:", error);
    return { success: false, error: error.message || "Error al registrar vacuna" };
  }
}

export async function updateVaccineStatusAction(
  vaccineId: number,
  status: "pending" | "applied" | "expired"
) {
  try {
    const [updated] = await db
      .update(vaccines)
      .set({
        status,
        appliedAt: status === "applied" ? new Date() : null,
      })
      .where(eq(vaccines.id, vaccineId))
      .returning();

    revalidatePath("/dashboard/historial");
    return { success: true, vaccine: updated };
  } catch (error: any) {
    console.error("Error updating vaccine status:", error);
    return { success: false, error: error.message || "Error al actualizar estado de vacuna" };
  }
}

export async function updateMedicalRecordAction(recordId: number, data: unknown) {
  const parsed = medicalRecordSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos del historial clínico inválidos",
    };
  }

  try {
    const [updated] = await db
      .update(medicalRecords)
      .set({
        petId: parsed.data.petId,
        vetId: parsed.data.vetId || null,
        appointmentId: parsed.data.appointmentId || null,
        reason: parsed.data.reason,
        symptoms: parsed.data.symptoms,
        diagnosis: parsed.data.diagnosis,
        treatment: parsed.data.treatment,
        prescription: parsed.data.prescription || null,
        weightKg: parsed.data.weightKg || null,
        temperatureC: parsed.data.temperatureC || null,
        internalNotes: parsed.data.internalNotes || null,
      })
      .where(eq(medicalRecords.id, recordId))
      .returning();

    if (parsed.data.weightKg) {
      await db
        .update(pets)
        .set({ weightKg: parsed.data.weightKg })
        .where(eq(pets.id, parsed.data.petId));
    }

    revalidatePath("/dashboard/historial");
    revalidatePath("/dashboard/mascotas");
    return { success: true, record: updated };
  } catch (error: any) {
    console.error("Error updating medical record:", error);
    return { success: false, error: error.message || "Error al actualizar la consulta médica" };
  }
}

export async function updateVaccineAction(vaccineId: number, data: unknown) {
  const parsed = vaccineSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de vacunación inválidos",
    };
  }

  try {
    const [updated] = await db
      .update(vaccines)
      .set({
        petId: parsed.data.petId,
        name: parsed.data.name,
        type: parsed.data.type,
        dose: parsed.data.dose,
        batchNumber: parsed.data.batchNumber || null,
        appliedAt: parsed.data.appliedAt ? new Date(parsed.data.appliedAt) : null,
        nextDueDate: new Date(parsed.data.nextDueDate),
        status: parsed.data.status,
        vetNotes: parsed.data.vetNotes || null,
      })
      .where(eq(vaccines.id, vaccineId))
      .returning();

    revalidatePath("/dashboard/historial");
    return { success: true, vaccine: updated };
  } catch (error: any) {
    console.error("Error updating vaccine:", error);
    return { success: false, error: error.message || "Error al actualizar la vacuna" };
  }
}

