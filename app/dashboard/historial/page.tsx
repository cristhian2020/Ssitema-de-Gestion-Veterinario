import {
  getMedicalRecordsAction,
  getVaccinesAction,
} from "@/lib/actions/medical-records";
import { getPetsAction } from "@/lib/actions/pets";
import { getUsersAction } from "@/lib/actions/appointments";
import { MedicalRecordsManager } from "@/components/dashboard/MedicalRecordsManager";

export const dynamic = "force-dynamic";

export default async function MedicalRecordsPage() {
  const [records, vaccines, pets, users] = await Promise.all([
    getMedicalRecordsAction(),
    getVaccinesAction(),
    getPetsAction(),
    getUsersAction(),
  ]);

  const vets = users.filter((u) => u.role === "vet" || u.role === "admin");

  return (
    <MedicalRecordsManager
      initialRecords={records}
      initialVaccines={vaccines}
      pets={pets}
      vets={vets}
    />
  );
}
