import { z } from "zod";

// 1. Esquema para Propietario (Dueño)
export const ownerSchema = z.object({
  fullName: z.string().min(2, "El nombre completo debe tener al menos 2 caracteres"),
  documentId: z.string().optional(),
  email: z.string().email("Correo electrónico inválido"),
  phone: z.string().min(6, "Teléfono de contacto requerido"),
  whatsapp: z.string().min(6, "Número de WhatsApp inválido").optional().or(z.literal("")),
  address: z.string().optional(),
  city: z.string().optional(),
  notes: z.string().optional(),
});

// 2. Esquema para Mascota
export const petSchema = z.object({
  ownerId: z.coerce.number().int().positive("Debe seleccionar un propietario válido"),
  name: z.string().min(1, "El nombre de la mascota es obligatorio"),
  species: z.string().min(1, "La especie es obligatoria"),
  breed: z.string().min(1, "La raza es obligatoria"),
  sex: z.enum(["Macho", "Hembra"], {
    message: "Selecciona Macho o Hembra",
  }),
  birthDate: z.string().optional(),
  weightKg: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "El peso debe ser un número válido (ej: 12.5)"),
  microchip: z.string().optional(),
  allergies: z.string().optional(),
  photoUrl: z.string().url("URL de imagen inválida").optional().or(z.literal("")),
  notes: z.string().optional(),
});

// 3. Esquema para Agendamiento de Citas
export const appointmentSchema = z.object({
  petId: z.coerce.number().int().positive("Selecciona una mascota"),
  ownerId: z.coerce.number().int().positive("Selecciona un propietario"),
  vetId: z.coerce.number().int().positive("Selecciona un profesional").optional().nullable(),
  serviceType: z.enum(["general", "vaccine", "surgery", "emergency", "grooming"], {
    message: "Selecciona un tipo de servicio válido",
  }),
  scheduledAt: z.string().min(1, "Selecciona fecha y hora de la cita"),
  durationMinutes: z.coerce.number().int().min(15).max(180).default(30),
  reason: z.string().min(3, "Indica el motivo de la consulta"),
  notes: z.string().optional(),
});

// 4. Esquema para Cita Rápida desde Landing Pública
export const publicBookingSchema = z.object({
  ownerName: z.string().min(2, "Ingresa tu nombre"),
  phone: z.string().min(6, "Ingresa tu teléfono"),
  email: z.string().email("Ingresa un email válido"),
  petName: z.string().min(1, "Nombre de tu mascota"),
  species: z.string().min(1, "Especie (Perro, Gato, etc.)"),
  serviceType: z.enum(["general", "vaccine", "surgery", "emergency", "grooming"]),
  preferredDate: z.string().min(1, "Selecciona una fecha preferida"),
  preferredTime: z.string().min(1, "Selecciona una franja horaria"),
  reason: z.string().min(3, "Describe brevemente el motivo"),
});

// 5. Esquema para Historial Clínico (Consulta Médica)
export const medicalRecordSchema = z.object({
  petId: z.coerce.number().int().positive("Mascota requerida"),
  vetId: z.coerce.number().int().positive("Veterinario requerido").optional().nullable(),
  appointmentId: z.coerce.number().int().positive().optional().nullable(),
  reason: z.string().min(3, "El motivo de la consulta es obligatorio"),
  symptoms: z.string().min(3, "Detalla los síntomas observados"),
  diagnosis: z.string().min(3, "Indica el diagnóstico presuntivo o definitivo"),
  treatment: z.string().min(3, "Indica el tratamiento a seguir"),
  prescription: z.string().optional(),
  weightKg: z
    .string()
    .regex(/^\d+(\.\d{1,2})?$/, "Peso inválido")
    .optional()
    .or(z.literal("")),
  temperatureC: z
    .string()
    .regex(/^\d+(\.\d{1})?$/, "Temperatura inválida (ej: 38.5)")
    .optional()
    .or(z.literal("")),
  internalNotes: z.string().optional(),
});

// 6. Esquema para Vacunación / Desparasitación
export const vaccineSchema = z.object({
  petId: z.coerce.number().int().positive("Mascota requerida"),
  name: z.string().min(2, "Nombre de la vacuna o antiparasitario"),
  type: z.enum(["vaccine", "deworming"]),
  dose: z.string().default("1ra Dosis"),
  batchNumber: z.string().optional(),
  appliedAt: z.string().optional().nullable(),
  nextDueDate: z.string().min(1, "Fecha de próximo vencimiento o dosis"),
  status: z.enum(["pending", "applied", "expired"]).default("pending"),
  vetNotes: z.string().optional(),
});

// 7. Esquema para Ítem de Inventario
export const inventoryItemSchema = z.object({
  name: z.string().min(2, "Nombre del producto"),
  sku: z.string().min(2, "SKU o código único"),
  category: z.enum(["medicine", "vaccine", "food", "supply"]),
  currentStock: z.coerce.number().int().min(0, "Stock actual debe ser >= 0"),
  minStock: z.coerce.number().int().min(1, "Stock mínimo debe ser >= 1"),
  unit: z.string().default("unidad"),
  unitCost: z.string().regex(/^\d+(\.\d{1,2})?$/, "Costo inválido"),
  salePrice: z.string().regex(/^\d+(\.\d{1,2})?$/, "Precio de venta inválido"),
  expiryDate: z.string().optional(),
});
