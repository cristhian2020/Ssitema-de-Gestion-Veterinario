"use server";

import { db } from "@/db";
import {
  appointments,
  pets,
  owners,
  users,
  type Appointment,
  type Pet,
  type Owner,
  type User,
} from "@/db/schema";
import { appointmentSchema, publicBookingSchema } from "@/lib/validations";
import { eq, desc, and, gte, lte, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { formatDate, formatTime, generateWhatsAppReminderLink } from "@/lib/utils";

export type AppointmentWithDetails = Appointment & {
  pet: Pet;
  owner: Owner;
  vet?: User | null;
};

export async function getAppointmentsAction(): Promise<AppointmentWithDetails[]> {
  try {
    const records = await db.query.appointments.findMany({
      with: {
        pet: true,
        owner: true,
        vet: true,
      },
      orderBy: [desc(appointments.scheduledAt)],
    });
    return records as AppointmentWithDetails[];
  } catch (error) {
    console.error("Error fetching appointments:", error);
    return [];
  }
}

export async function getUsersAction(): Promise<User[]> {
  try {
    return await db.query.users.findMany({
      where: eq(users.active, true),
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return [];
  }
}

/**
 * Verifica si hay conflicto de horario para el veterinario o la clínica
 */
async function checkScheduleConflict(
  vetId: number | null | undefined,
  scheduledAt: Date,
  durationMinutes: number
): Promise<boolean> {
  const appointmentStart = new Date(scheduledAt);
  const appointmentEnd = new Date(appointmentStart.getTime() + durationMinutes * 60000);

  // Buscar citas activas (no canceladas) que se solapen
  const overlapping = await db.query.appointments.findFirst({
    where: and(
      vetId ? eq(appointments.vetId, vetId) : sql`1=1`,
      sql`${appointments.status} NOT IN ('cancelled', 'completed')`,
      // Solapamiento: existing.start < new.end AND existing.end > new.start
      sql`${appointments.scheduledAt} < ${appointmentEnd} AND (${appointments.scheduledAt} + (${appointments.durationMinutes} * interval '1 minute')) > ${appointmentStart}`
    ),
  });

  return !!overlapping;
}

export async function createAppointmentAction(data: unknown) {
  const parsed = appointmentSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos de la cita inválidos",
    };
  }

  const scheduledDate = new Date(parsed.data.scheduledAt);
  if (isNaN(scheduledDate.getTime())) {
    return { success: false, error: "Fecha y hora no válidas" };
  }

  // 1. Verificación de disponibilidad horaria
  const hasConflict = await checkScheduleConflict(
    parsed.data.vetId,
    scheduledDate,
    parsed.data.durationMinutes
  );

  if (hasConflict) {
    return {
      success: false,
      error: "El horario seleccionado ya se encuentra reservado. Por favor, selecciona otro horario.",
    };
  }

  try {
    const [newAppointment] = await db
      .insert(appointments)
      .values({
        petId: parsed.data.petId,
        ownerId: parsed.data.ownerId,
        vetId: parsed.data.vetId || null,
        serviceType: parsed.data.serviceType,
        status: "pending",
        scheduledAt: scheduledDate,
        durationMinutes: parsed.data.durationMinutes,
        reason: parsed.data.reason,
        notes: parsed.data.notes || null,
        reminderSent: false,
      })
      .returning();

    // Obtener datos para enlace WhatsApp
    const pet = await db.query.pets.findFirst({ where: eq(pets.id, parsed.data.petId) });
    const owner = await db.query.owners.findFirst({ where: eq(owners.id, parsed.data.ownerId) });

    const whatsappLink =
      owner && pet
        ? generateWhatsAppReminderLink({
            phone: owner.whatsapp,
            ownerName: owner.fullName,
            petName: pet.name,
            dateStr: formatDate(scheduledDate),
            timeStr: formatTime(scheduledDate),
            serviceName: parsed.data.serviceType.toUpperCase(),
          })
        : null;

    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard");
    return { success: true, appointment: newAppointment, whatsappLink };
  } catch (error: any) {
    console.error("Error creating appointment:", error);
    return { success: false, error: error.message || "Error al programar la cita" };
  }
}

export async function updateAppointmentStatusAction(
  appointmentId: number,
  status: "pending" | "in_progress" | "completed" | "cancelled"
) {
  try {
    const [updated] = await db
      .update(appointments)
      .set({ status })
      .where(eq(appointments.id, appointmentId))
      .returning();

    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard");
    return { success: true, appointment: updated };
  } catch (error: any) {
    console.error("Error updating appointment status:", error);
    return { success: false, error: error.message || "Error al actualizar el estado de la cita" };
  }
}

/**
 * Acción para el portal público: los dueños solicitan cita sin fricción
 */
export async function bookPublicAppointmentAction(data: unknown) {
  const parsed = publicBookingSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Por favor verifica los datos ingresados",
    };
  }

  try {
    // 1. Buscar o crear propietario
    let owner = await db.query.owners.findFirst({
      where: eq(owners.email, parsed.data.email),
    });

    if (!owner) {
      const [newOwner] = await db
        .insert(owners)
        .values({
          fullName: parsed.data.ownerName,
          email: parsed.data.email,
          phone: parsed.data.phone,
          whatsapp: parsed.data.phone,
          address: "Portal Web",
          city: "Buenos Aires",
        })
        .returning();
      owner = newOwner;
    }

    // 2. Buscar o crear mascota para el dueño
    let pet = await db.query.pets.findFirst({
      where: and(eq(pets.ownerId, owner.id), eq(pets.name, parsed.data.petName)),
    });

    if (!pet) {
      const [newPet] = await db
        .insert(pets)
        .values({
          ownerId: owner.id,
          name: parsed.data.petName,
          species: parsed.data.species,
          breed: "A determinar en consulta",
          sex: "Macho",
          weightKg: "0.0",
        })
        .returning();
      pet = newPet;
    }

    // 3. Crear la cita combinando fecha y hora preferida
    const scheduledDateTime = new Date(`${parsed.data.preferredDate}T${parsed.data.preferredTime}:00`);

    const [newAppointment] = await db
      .insert(appointments)
      .values({
        petId: pet.id,
        ownerId: owner.id,
        serviceType: parsed.data.serviceType,
        status: "pending",
        scheduledAt: isNaN(scheduledDateTime.getTime()) ? new Date() : scheduledDateTime,
        durationMinutes: 30,
        reason: parsed.data.reason,
        notes: "Solicitud recibida desde Portal Web Público",
      })
      .returning();

    revalidatePath("/dashboard/citas");
    revalidatePath("/dashboard");

    return {
      success: true,
      appointment: newAppointment,
      message: "¡Tu solicitud de cita ha sido recibida! Te contactaremos a la brevedad por WhatsApp.",
    };
  } catch (error: any) {
    console.error("Error booking public appointment:", error);
    return { success: false, error: "Hubo un error al procesar tu reserva. Intenta nuevamente." };
  }
}
