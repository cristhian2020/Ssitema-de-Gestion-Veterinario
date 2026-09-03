import { getPetsAction, getOwnersAction } from "@/lib/actions/pets";
import { PetsManager } from "@/components/dashboard/PetsManager";

export const dynamic = "force-dynamic";

export default async function PetsPage() {
  const [pets, owners] = await Promise.all([
    getPetsAction(),
    getOwnersAction(),
  ]);

  return <PetsManager initialPets={pets} owners={owners} />;
}
