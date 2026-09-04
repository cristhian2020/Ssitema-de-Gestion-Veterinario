"use server";

import { db } from "@/db";
import {
  inventoryItems,
  services,
  type InventoryItem,
  type Service,
} from "@/db/schema";
import { inventoryItemSchema } from "@/lib/validations";
import { eq, desc, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";

export type InventoryItemWithAlert = InventoryItem & {
  isLowStock: boolean;
};

export async function getInventoryItemsAction(): Promise<InventoryItemWithAlert[]> {
  try {
    const items = await db.query.inventoryItems.findMany({
      orderBy: [desc(inventoryItems.createdAt)],
    });

    return items.map((item) => ({
      ...item,
      isLowStock: item.currentStock <= item.minStock,
    }));
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    return [];
  }
}

export async function getServicesAction(): Promise<Service[]> {
  try {
    return await db.query.services.findMany({
      where: eq(services.active, true),
      orderBy: [services.category, services.name],
    });
  } catch (error) {
    console.error("Error fetching services:", error);
    return [];
  }
}

export async function updateStockAction(itemId: number, delta: number) {
  try {
    const [updated] = await db
      .update(inventoryItems)
      .set({
        currentStock: sql`GREATEST(0, ${inventoryItems.currentStock} + ${delta})`,
      })
      .where(eq(inventoryItems.id, itemId))
      .returning();

    revalidatePath("/dashboard/inventario");
    revalidatePath("/dashboard");
    return { success: true, item: updated };
  } catch (error: any) {
    console.error("Error adjusting stock:", error);
    return { success: false, error: error.message || "Error al actualizar el stock" };
  }
}

import { getSession } from "@/lib/auth/session";

export async function createInventoryItemAction(data: unknown) {
  const session = await getSession();
  if (session && session.role !== "admin") {
    return {
      success: false,
      error: "Acceso denegado: Solo los administradores pueden registrar nuevos ítems o fijar tarifas",
    };
  }

  const parsed = inventoryItemSchema.safeParse(data);
  if (!parsed.success) {
    return {
      success: false,
      error: parsed.error.issues[0]?.message || "Datos del producto inválidos",
    };
  }

  try {
    const [newItem] = await db
      .insert(inventoryItems)
      .values({
        name: parsed.data.name,
        sku: parsed.data.sku,
        category: parsed.data.category,
        currentStock: parsed.data.currentStock,
        minStock: parsed.data.minStock,
        unit: parsed.data.unit,
        unitCost: parsed.data.unitCost,
        salePrice: parsed.data.salePrice,
        expiryDate: parsed.data.expiryDate || null,
      })
      .returning();

    revalidatePath("/dashboard/inventario");
    return { success: true, item: newItem };
  } catch (error: any) {
    console.error("Error creating inventory item:", error);
    return { success: false, error: error.message || "Error al agregar ítem al inventario" };
  }
}

export async function deleteInventoryItemAction(itemId: number) {
  const session = await getSession();
  if (session && session.role !== "admin") {
    return {
      success: false,
      error: "Acceso denegado: Solo los administradores pueden eliminar ítems del catálogo",
    };
  }

  try {
    await db.delete(inventoryItems).where(eq(inventoryItems.id, itemId));
    revalidatePath("/dashboard/inventario");
    return { success: true };
  } catch (error: any) {
    console.error("Error deleting inventory item:", error);
    return { success: false, error: error.message || "Error al eliminar producto" };
  }
}

