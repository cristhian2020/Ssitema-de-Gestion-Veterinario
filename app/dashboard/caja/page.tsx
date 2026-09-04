import { getPaymentsAction, getDailyCashSummaryAction } from "@/lib/actions/billing";
import { getOwnersAction, getPetsAction } from "@/lib/actions/pets";
import { CashRegisterManager } from "@/components/dashboard/CashRegisterManager";

export const dynamic = "force-dynamic";

export default async function CajaPage() {
  const [payments, owners, pets, summary] = await Promise.all([
    getPaymentsAction(),
    getOwnersAction(),
    getPetsAction(),
    getDailyCashSummaryAction(),
  ]);

  return (
    <CashRegisterManager
      initialPayments={payments}
      owners={owners}
      pets={pets}
      summary={summary}
    />
  );
}
