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
import { eq, desc, and, or, gte, lte, sql } from "drizzle-orm";
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
 * Normaliza y compara si dos nombres corresponden a la misma persona
 */
function isSameOwnerName(name1: string, name2: string): boolean {
  const normalize = (s: string) =>
    s
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[^a-z0-9\s]/g, "")
      .trim();

  const n1 = normalize(name1);
  const n2 = normalize(name2);
  if (!n1 || !n2) return false;
  if (n1 === n2) return true;

  // Si uno contiene exactamente al otro (ej: "Esther Ferrufino" y "Esther Ferrufino Villarroel")
  if (n1.includes(n2) || n2.includes(n1)) return true;

  const w1 = n1.split(/\s+/).filter(Boolean);
  const w2 = n2.split(/\s+/).filter(Boolean);
  const [shorter, longer] = w1.length <= w2.length ? [w1, w2] : [w2, w1];

  const matched = shorter.filter((w) =>
    longer.some((lw) => lw === w || (w.length >= 4 && (lw.includes(w) || w.includes(lw))))
  );

  if (shorter.length === 1) {
    return matched.length === 1 && shorter[0].length >= 4;
  }
  return matched.length >= Math.min(2, shorter.length);
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
    const cleanName = parsed.data.ownerName.trim();
    const cleanEmail = parsed.data.email.trim().toLowerCase();
    const cleanPhone = parsed.data.phone.trim();
    const cleanPetName = parsed.data.petName.trim();
    const cleanSpecies = parsed.data.species.trim();

    // 1. Buscar si el solicitante ya es un cliente registrado en la clínica.
    // Para considerarse el MISMO cliente, debe coincidir tanto su nombre como algún dato de contacto.
    const candidateOwners = await db.query.owners.findMany({
      where: or(
        eq(owners.email, cleanEmail),
        eq(owners.phone, cleanPhone),
        eq(owners.whatsapp, cleanPhone)
      ),
    });

    let owner = candidateOwners.find((c) => isSameOwnerName(c.fullName, cleanName));

    // Si no coincidió por teléfono o correo, verificar si existe un único propietario con el mismo nombre exacto
    if (!owner) {
      const nameCandidates = await db.query.owners.findMany({
        where: sql`LOWER(TRIM(${owners.fullName})) = ${cleanName.toLowerCase()}`,
      });
      if (nameCandidates.length === 1) {
        owner = nameCandidates[0];
      }
    }

    // Si NO se encontró un propietario con ese nombre, registrar al nuevo propietario con los datos de quien solicita la cita
    if (!owner) {
      const [newOwner] = await db
        .insert(owners)
        .values({
          fullName: cleanName,
          email: cleanEmail,
          phone: cleanPhone,
          whatsapp: cleanPhone,
          address: "Portal Web (Dirección pendiente)",
          city: "Buenos Aires",
          notes: "Registrado automáticamente desde Reserva de Cita Web",
        })
        .returning();
      owner = newOwner;
    }

    // 2. Buscar o crear mascota para el dueño identificado o creado
    let pet = await db.query.pets.findFirst({
      where: and(
        eq(pets.ownerId, owner.id),
        sql`LOWER(TRIM(${pets.name})) = ${cleanPetName.toLowerCase()}`
      ),
    });

    if (!pet) {
      const [newPet] = await db
        .insert(pets)
        .values({
          ownerId: owner.id,
          name: cleanPetName,
          species: cleanSpecies,
          breed: "A determinar",
          sex: "Macho",
          weightKg: "0.0",
          notes: `Origen: Reserva Portal Web. Ficha clínica pendiente de completar en recepción. Solicitante: ${cleanName} (Tel: ${cleanPhone}).`,
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
        notes: `Solicitud recibida desde Portal Web Público. Solicitante: ${cleanName} (Tel: ${cleanPhone}, Email: ${cleanEmail})`,
      })
      .returning();

    try {
      revalidatePath("/dashboard/mascotas");
      revalidatePath("/dashboard/citas");
      revalidatePath("/dashboard/historial");
      revalidatePath("/dashboard");
      revalidatePath("/");
    } catch {
      // No interrumpir si se ejecuta fuera de contexto HTTP (ej: tests o scripts)
    }

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
