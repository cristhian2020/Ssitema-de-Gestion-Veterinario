"use server";

import { db } from "@/db";
import { payments, owners, pets, appointments, type Payment } from "@/db/schema";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type PaymentWithDetails = Payment & {
  owner: typeof owners.$inferSelect;
  pet?: typeof pets.$inferSelect | null;
};

export async function getPaymentsAction(): Promise<PaymentWithDetails[]> {
  try {
    const list = await db.query.payments.findMany({
      with: {
        owner: true,
        pet: true,
      },
      orderBy: [desc(payments.createdAt)],
    });
    return list as PaymentWithDetails[];
  } catch (error) {
    console.error("Error fetching payments:", error);
    return [];
  }
}

export async function createPaymentAction(data: {
  ownerId: number;
  petId?: number;
  appointmentId?: number;
  amount: string | number;
  paymentMethod: "cash" | "card" | "transfer_qr";
  concept: string;
  status?: "paid" | "pending" | "cancelled";
  notes?: string;
}) {
  try {
    const cleanAmount = Number(data.amount);
    if (isNaN(cleanAmount) || cleanAmount <= 0) {
      return { success: false, error: "El monto a cobrar debe ser mayor a 0" };
    }
    if (!data.ownerId) {
      return { success: false, error: "Selecciona el propietario responsable del pago" };
    }
    if (!data.concept?.trim()) {
      return { success: false, error: "El concepto de cobro es requerido" };
    }

    const year = new Date().getFullYear();
    const randomNum = Math.floor(10000 + Math.random() * 90000);
    const generatedInvoiceNumber = `REC-${year}-${randomNum}`;

    const [newPayment] = await db
      .insert(payments)
      .values({
        ownerId: data.ownerId,
        petId: data.petId || null,
        appointmentId: data.appointmentId || null,
        amount: cleanAmount.toFixed(2),
        paymentMethod: data.paymentMethod,
        concept: data.concept.trim(),
        status: data.status || "paid",
        invoiceNumber: generatedInvoiceNumber,
        notes: data.notes?.trim() || null,
      })
      .returning();

    // Fetch details for instant frontend injection
    const [owner] = await db.select().from(owners).where(eq(owners.id, data.ownerId)).limit(1);
    let pet = null;
    if (data.petId) {
      const [foundPet] = await db.select().from(pets).where(eq(pets.id, data.petId)).limit(1);
      pet = foundPet || null;
    }

    revalidatePath("/dashboard/caja");
    revalidatePath("/dashboard");

    return {
      success: true,
      payment: {
        ...newPayment,
        owner,
        pet,
      } as PaymentWithDetails,
    };
  } catch (error: any) {
    console.error("Error creating payment:", error);
    return { success: false, error: error.message || "No se pudo registrar el pago" };
  }
}

export async function getDailyCashSummaryAction() {
  try {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const list = await db.query.payments.findMany({
      where: sql`${payments.createdAt} >= ${today.toISOString()} AND ${payments.status} = 'paid'`,
    });

    let total = 0;
    let cash = 0;
    let card = 0;
    let transfer = 0;

    for (const p of list) {
      const val = parseFloat(p.amount) || 0;
      total += val;
      if (p.paymentMethod === "cash") cash += val;
      else if (p.paymentMethod === "card") card += val;
      else if (p.paymentMethod === "transfer_qr") transfer += val;
    }

    return {
      total,
      cash,
      card,
      transfer,
      count: list.length,
    };
  } catch (error) {
    console.error("Error calculating daily cash summary:", error);
    return { total: 0, cash: 0, card: 0, transfer: 0, count: 0 };
  }
}
