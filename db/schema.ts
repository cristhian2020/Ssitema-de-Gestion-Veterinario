import { pgTable, serial, text, timestamp, integer, numeric, boolean } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ----------------------------------------------------
// 1. Usuarios del Sistema (Roles Clínicos)
// ----------------------------------------------------
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  role: text("role", { enum: ["admin", "vet", "receptionist", "client"] })
    .default("vet")
    .notNull(),
  phone: text("phone"),
  specialty: text("specialty"), // Ej. Medicina Felina, Cirugía, General
  avatarUrl: text("avatar_url"),
  passwordHash: text("password_hash"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const usersRelations = relations(users, ({ many }) => ({
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
}));

// ----------------------------------------------------
// 2. Propietarios / Clientes
// ----------------------------------------------------
export const owners = pgTable("owners", {
  id: serial("id").primaryKey(),
  fullName: text("full_name").notNull(),
  documentId: text("document_id"), // Cédula / DNI
  email: text("email").notNull(),
  phone: text("phone").notNull(),
  whatsapp: text("whatsapp").notNull(), // Formato internacional ej: +5491112345678
  address: text("address"),
  city: text("city"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const ownersRelations = relations(owners, ({ many }) => ({
  pets: many(pets),
  appointments: many(appointments),
}));

// ----------------------------------------------------
// 3. Pacientes (Mascotas)
// ----------------------------------------------------
export const pets = pgTable("pets", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .references(() => owners.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(),
  species: text("species").notNull(), // Perro, Gato, Ave, Exótico, etc.
  breed: text("breed").notNull(), // Ej: Golden Retriever, Siamés
  sex: text("sex", { enum: ["Macho", "Hembra"] }).notNull(),
  birthDate: text("birth_date"), // YYYY-MM-DD
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }).notNull(), // Peso en Kg
  microchip: text("microchip"), // Chip identificador único
  allergies: text("allergies"), // Alergias a medicamentos, alimentos
  photoUrl: text("photo_url"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const petsRelations = relations(pets, ({ one, many }) => ({
  owner: one(owners, {
    fields: [pets.ownerId],
    references: [owners.id],
  }),
  appointments: many(appointments),
  medicalRecords: many(medicalRecords),
  vaccines: many(vaccines),
}));

// ----------------------------------------------------
// 4. Citas y Reservas
// ----------------------------------------------------
export const appointments = pgTable("appointments", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id")
    .references(() => pets.id, { onDelete: "cascade" })
    .notNull(),
  ownerId: integer("owner_id")
    .references(() => owners.id, { onDelete: "cascade" })
    .notNull(),
  vetId: integer("vet_id").references(() => users.id, { onDelete: "set null" }),
  serviceType: text("service_type", {
    enum: ["general", "vaccine", "surgery", "emergency", "grooming"],
  }).notNull(),
  status: text("status", {
    enum: ["pending", "in_progress", "completed", "cancelled"],
  })
    .default("pending")
    .notNull(),
  scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  reason: text("reason").notNull(),
  notes: text("notes"),
  reminderSent: boolean("reminder_sent").default(false).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const appointmentsRelations = relations(appointments, ({ one }) => ({
  pet: one(pets, {
    fields: [appointments.petId],
    references: [pets.id],
  }),
  owner: one(owners, {
    fields: [appointments.ownerId],
    references: [owners.id],
  }),
  vet: one(users, {
    fields: [appointments.vetId],
    references: [users.id],
  }),
}));

// ----------------------------------------------------
// 5. Historial Clínico Digital
// ----------------------------------------------------
export const medicalRecords = pgTable("medical_records", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id")
    .references(() => pets.id, { onDelete: "cascade" })
    .notNull(),
  vetId: integer("vet_id").references(() => users.id, { onDelete: "set null" }),
  appointmentId: integer("appointment_id").references(() => appointments.id, {
    onDelete: "set null",
  }),
  reason: text("reason").notNull(),
  symptoms: text("symptoms").notNull(),
  diagnosis: text("diagnosis").notNull(),
  treatment: text("treatment").notNull(),
  prescription: text("prescription"), // Medicamentos recetados, posología
  weightKg: numeric("weight_kg", { precision: 5, scale: 2 }),
  temperatureC: numeric("temperature_c", { precision: 4, scale: 1 }), // Ej: 38.5
  internalNotes: text("internal_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const medicalRecordsRelations = relations(medicalRecords, ({ one }) => ({
  pet: one(pets, {
    fields: [medicalRecords.petId],
    references: [pets.id],
  }),
  vet: one(users, {
    fields: [medicalRecords.vetId],
    references: [users.id],
  }),
  appointment: one(appointments, {
    fields: [medicalRecords.appointmentId],
    references: [appointments.id],
  }),
}));

// ----------------------------------------------------
// 6. Calendario de Vacunación & Desparasitación
// ----------------------------------------------------
export const vaccines = pgTable("vaccines", {
  id: serial("id").primaryKey(),
  petId: integer("pet_id")
    .references(() => pets.id, { onDelete: "cascade" })
    .notNull(),
  name: text("name").notNull(), // Ej: Rabia, Séxtuple, Triple Felina, Antiparasitario Interno
  type: text("type", { enum: ["vaccine", "deworming"] })
    .default("vaccine")
    .notNull(),
  dose: text("dose").default("1ra Dosis"), // 1ra Dosis, Refuerzo Anual, etc.
  batchNumber: text("batch_number"),
  appliedAt: timestamp("applied_at", { withTimezone: true }),
  nextDueDate: timestamp("next_due_date", { withTimezone: true }).notNull(),
  status: text("status", { enum: ["pending", "applied", "expired"] })
    .default("pending")
    .notNull(),
  vetNotes: text("vet_notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const vaccinesRelations = relations(vaccines, ({ one }) => ({
  pet: one(pets, {
    fields: [vaccines.petId],
    references: [pets.id],
  }),
}));

// ----------------------------------------------------
// 7. Catálogo de Servicios y Precios
// ----------------------------------------------------
export const services = pgTable("services", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  category: text("category").notNull(), // Consulta, Vacunas, Quirúrgico, Estética, Laboratorio
  price: numeric("price", { precision: 10, scale: 2 }).notNull(),
  durationMinutes: integer("duration_minutes").default(30).notNull(),
  description: text("description"),
  active: boolean("active").default(true).notNull(),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------
// 8. Control de Inventario Básico
// ----------------------------------------------------
export const inventoryItems = pgTable("inventory_items", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sku: text("sku").unique().notNull(),
  category: text("category", {
    enum: ["medicine", "vaccine", "food", "supply"],
  }).notNull(),
  currentStock: integer("current_stock").default(0).notNull(),
  minStock: integer("min_stock").default(5).notNull(),
  unit: text("unit").default("unidad").notNull(), // frasco, caja, comprimido, kg
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }).notNull(),
  salePrice: numeric("sale_price", { precision: 10, scale: 2 }).notNull(),
  expiryDate: text("expiry_date"), // YYYY-MM-DD
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

// ----------------------------------------------------
// 9. Facturación, Caja Diaria y Pagos (POS)
// ----------------------------------------------------
export const payments = pgTable("payments", {
  id: serial("id").primaryKey(),
  ownerId: integer("owner_id")
    .references(() => owners.id, { onDelete: "cascade" })
    .notNull(),
  petId: integer("pet_id").references(() => pets.id, { onDelete: "set null" }),
  appointmentId: integer("appointment_id").references(() => appointments.id, { onDelete: "set null" }),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  paymentMethod: text("payment_method", {
    enum: ["cash", "card", "transfer_qr"],
  })
    .default("cash")
    .notNull(),
  concept: text("concept").notNull(), // Ej: Consulta General, Cirugía, Vacuna, Farmacia
  status: text("status", {
    enum: ["paid", "pending", "cancelled"],
  })
    .default("paid")
    .notNull(),
  invoiceNumber: text("invoice_number"),
  notes: text("notes"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const paymentsRelations = relations(payments, ({ one }) => ({
  owner: one(owners, {
    fields: [payments.ownerId],
    references: [owners.id],
  }),
  pet: one(pets, {
    fields: [payments.petId],
    references: [pets.id],
  }),
  appointment: one(appointments, {
    fields: [payments.appointmentId],
    references: [appointments.id],
  }),
}));

// Types inferidos
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;

export type Owner = typeof owners.$inferSelect;
export type NewOwner = typeof owners.$inferInsert;

export type Pet = typeof pets.$inferSelect;
export type NewPet = typeof pets.$inferInsert;

export type Appointment = typeof appointments.$inferSelect;
export type NewAppointment = typeof appointments.$inferInsert;

export type MedicalRecord = typeof medicalRecords.$inferSelect;
export type NewMedicalRecord = typeof medicalRecords.$inferInsert;

export type Vaccine = typeof vaccines.$inferSelect;
export type NewVaccine = typeof vaccines.$inferInsert;

export type Service = typeof services.$inferSelect;
export type NewService = typeof services.$inferInsert;

export type InventoryItem = typeof inventoryItems.$inferSelect;
export type NewInventoryItem = typeof inventoryItems.$inferInsert;

export type Payment = typeof payments.$inferSelect;
export type NewPayment = typeof payments.$inferInsert;

