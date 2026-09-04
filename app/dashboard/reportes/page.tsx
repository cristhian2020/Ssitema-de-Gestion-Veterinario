import { getPetsAction } from "@/lib/actions/pets";
import { getInventoryItemsAction } from "@/lib/actions/inventory";
import { getAppointmentsAction } from "@/lib/actions/appointments";
import { getPaymentsAction } from "@/lib/actions/billing";
import { ReportsManager } from "@/components/dashboard/ReportsManager";

export const dynamic = "force-dynamic";

export default async function ReportesPage() {
  const [pets, inventory, appointments, payments] = await Promise.all([
    getPetsAction(),
    getInventoryItemsAction(),
    getAppointmentsAction(),
    getPaymentsAction(),
  ]);

  return (
    <ReportsManager
      pets={pets}
      inventory={inventory}
      appointments={appointments}
      payments={payments}
    />
  );
}
