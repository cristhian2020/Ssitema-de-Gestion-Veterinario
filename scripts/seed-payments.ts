import { db } from "../db";
import { payments, owners, pets, appointments } from "../db/schema";

async function main() {
  console.log("💰 Sembrando pagos iniciales para caja y facturación...");

  const allOwners = await db.select().from(owners);
  const allPets = await db.select().from(pets);

  if (allOwners.length === 0) {
    console.log("No hay propietarios para asociar pagos.");
    process.exit(0);
  }

  const existingPayments = await db.select().from(payments);
  if (existingPayments.length > 0) {
    console.log(`Ya existen ${existingPayments.length} pagos en la base de datos.`);
    process.exit(0);
  }

  const samplePayments = [
    {
      ownerId: allOwners[0].id,
      petId: allPets[0]?.id || null,
      amount: "8500.00",
      paymentMethod: "card" as const,
      concept: "Consulta General + Antiparasitario Interno",
      status: "paid" as const,
      invoiceNumber: "REC-2026-10492",
      notes: "Cobrado con tarjeta de débito en recepción",
    },
    {
      ownerId: allOwners[1]?.id || allOwners[0].id,
      petId: allPets[1]?.id || null,
      amount: "12000.00",
      paymentMethod: "transfer_qr" as const,
      concept: "Vacuna Séxtuple Canina + Certificado Oficial",
      status: "paid" as const,
      invoiceNumber: "REC-2026-10493",
      notes: "Transferencia bancaria QR acreditada",
    },
    {
      ownerId: allOwners[2]?.id || allOwners[0].id,
      petId: allPets[2]?.id || null,
      amount: "6500.00",
      paymentMethod: "cash" as const,
      concept: "Alimento Terapéutico Hepático 3kg",
      status: "paid" as const,
      invoiceNumber: "REC-2026-10494",
      notes: "Pago en efectivo en mostrador",
    },
    {
      ownerId: allOwners[0].id,
      petId: allPets[0]?.id || null,
      amount: "25000.00",
      paymentMethod: "card" as const,
      concept: "Limpieza Dental con Ultrasonido & Anestesia",
      status: "paid" as const,
      invoiceNumber: "REC-2026-10495",
      notes: "Pago con tarjeta de crédito en 1 pago",
    },
  ];

  await db.insert(payments).values(samplePayments);
  console.log(`✓ Insertados ${samplePayments.length} pagos de muestra con éxito.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Error sembrando pagos:", err);
  process.exit(1);
});
