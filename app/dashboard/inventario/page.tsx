import {
  getInventoryItemsAction,
  getServicesAction,
} from "@/lib/actions/inventory";
import { InventoryManager } from "@/components/dashboard/InventoryManager";

export const dynamic = "force-dynamic";

export default async function InventoryPage() {
  const [inventory, services] = await Promise.all([
    getInventoryItemsAction(),
    getServicesAction(),
  ]);

  return <InventoryManager initialInventory={inventory} services={services} />;
}
