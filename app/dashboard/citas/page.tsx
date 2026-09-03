import { getAppointmentsAction, getUsersAction } from "@/lib/actions/appointments";
import { getPetsAction } from "@/lib/actions/pets";
import { AppointmentsManager } from "@/components/dashboard/AppointmentsManager";

export const dynamic = "force-dynamic";

export default async function AppointmentsPage() {
  const [appointments, pets, users] = await Promise.all([
    getAppointmentsAction(),
    getPetsAction(),
    getUsersAction(),
  ]);

  const vets = users.filter((u) => u.role === "vet" || u.role === "admin");

  return (
    <AppointmentsManager
      initialAppointments={appointments}
      pets={pets}
      vets={vets}
    />
  );
}
