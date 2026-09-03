import Link from "next/link";
import {
  CalendarDays,
  PawPrint,
  AlertTriangle,
  Clock,
  ArrowUpRight,
  Plus,
  Phone,
  MessageCircle,
  Activity,
  CheckCircle,
} from "lucide-react";
import { getAppointmentsAction } from "@/lib/actions/appointments";
import { getPetsAction } from "@/lib/actions/pets";
import { getInventoryItemsAction } from "@/lib/actions/inventory";
import { getVaccinesAction } from "@/lib/actions/medical-records";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { formatDate, formatTime, generateWhatsAppReminderLink } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const [appointments, pets, inventory, vaccines] = await Promise.all([
    getAppointmentsAction(),
    getPetsAction(),
    getInventoryItemsAction(),
    getVaccinesAction(),
  ]);

  const lowStockItems = inventory.filter((i) => i.isLowStock);
  const pendingVaccines = vaccines.filter((v) => v.status === "pending" || v.status === "expired");

  const todayStr = new Date().toISOString().split("T")[0];
  const todayAppointments = appointments.filter((a) => {
    const aptDate = new Date(a.scheduledAt).toISOString().split("T")[0];
    return aptDate === todayStr;
  });

  const statusVariantMap: Record<string, "blue" | "green" | "amber" | "red" | "gray"> = {
    pending: "amber",
    in_progress: "blue",
    completed: "green",
    cancelled: "red",
  };

  const statusLabelMap: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En Consulta",
    completed: "Finalizada",
    cancelled: "Cancelada",
  };

  const serviceLabelMap: Record<string, string> = {
    general: "Consulta General",
    vaccine: "Vacunación",
    surgery: "Cirugía",
    emergency: "Urgencia 24/7",
    grooming: "Estética & Baño",
  };

  return (
    <div className="space-y-8">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-6 rounded-3xl border border-[#e5e5ea] shadow-xs">
        <div>
          <span className="text-xs font-semibold text-[#0066cc] uppercase tracking-wider">
            Panel de Control Clínico
          </span>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight mt-1">
            Veterinaria Huellitas Felices
          </h2>
          <p className="text-sm text-[#7a7a7a] mt-0.5">
            Monitor en tiempo real de consultas, pacientes hospitalizados y stock médico.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/dashboard/citas">
            <Button variant="primary" size="md">
              <Plus className="w-4 h-4" />
              Nueva Cita
            </Button>
          </Link>
          <Link href="/dashboard/mascotas">
            <Button variant="secondary" size="md">
              <PawPrint className="w-4 h-4" />
              Nuevo Paciente
            </Button>
          </Link>
        </div>
      </div>

      {/* Metrics Cards (Apple style) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-[#7a7a7a]">
            <span className="text-xs font-medium">Citas para Hoy</span>
            <div className="p-2 rounded-xl bg-[#0066cc]/10 text-[#0066cc]">
              <CalendarDays className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {todayAppointments.length}
            </div>
            <div className="text-xs text-[#7a7a7a] mt-1 flex items-center gap-1">
              <span className="text-[#0066cc] font-medium">{appointments.length}</span> en total
              registradas
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-[#7a7a7a]">
            <span className="text-xs font-medium">Pacientes Registrados</span>
            <div className="p-2 rounded-xl bg-[#34c759]/10 text-[#34c759]">
              <PawPrint className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {pets.length}
            </div>
            <div className="text-xs text-[#7a7a7a] mt-1 flex items-center gap-1">
              Historias clínicas activas
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-[#7a7a7a]">
            <span className="text-xs font-medium">Alertas de Stock</span>
            <div className="p-2 rounded-xl bg-[#ff9500]/10 text-[#ff9500]">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {lowStockItems.length}
            </div>
            <div className="text-xs text-[#ff9500] font-medium mt-1">
              {lowStockItems.length > 0 ? "Requieren reposición urgente" : "Stock en nivel óptimo"}
            </div>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-[#7a7a7a]">
            <span className="text-xs font-medium">Vacunas por Vencer</span>
            <div className="p-2 rounded-xl bg-[#af52de]/10 text-[#af52de]">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-semibold text-[#1d1d1f] tracking-tight">
              {pendingVaccines.length}
            </div>
            <div className="text-xs text-[#7a7a7a] mt-1">Pendientes o vencidas</div>
          </div>
        </div>
      </div>

      {/* Main Grid: Agenda de Hoy & Alertas Rápidas */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Agenda de Citas del Día */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#e5e5ea] p-6 shadow-xs">
          <div className="flex items-center justify-between pb-4 border-b border-[#f0f0f0]">
            <div>
              <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">
                Agenda de Consultas
              </h3>
              <p className="text-xs text-[#7a7a7a]">
                Citas y procedimientos programados para la jornada
              </p>
            </div>
            <Link
              href="/dashboard/citas"
              className="text-xs font-semibold text-[#0066cc] hover:underline flex items-center gap-1"
            >
              Ver agenda completa
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-[#f0f0f0] mt-2">
            {appointments.length === 0 ? (
              <div className="py-12 text-center text-sm text-[#7a7a7a]">
                No hay citas agendadas aún. ¡Haz clic en "Nueva Cita" para comenzar!
              </div>
            ) : (
              appointments.slice(0, 5).map((apt) => {
                const whatsappUrl = generateWhatsAppReminderLink({
                  phone: apt.owner?.whatsapp || "",
                  ownerName: apt.owner?.fullName || "",
                  petName: apt.pet?.name || "",
                  dateStr: formatDate(apt.scheduledAt),
                  timeStr: formatTime(apt.scheduledAt),
                  serviceName: serviceLabelMap[apt.serviceType] || apt.serviceType,
                });

                return (
                  <div
                    key={apt.id}
                    className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-[#fafafc] -mx-3 px-3 rounded-2xl transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#f5f5f7] flex flex-col items-center justify-center shrink-0 border border-[#e5e5ea]">
                        <span className="text-[10px] font-bold text-[#0066cc]">
                          {formatTime(apt.scheduledAt)}
                        </span>
                        <span className="text-[9px] text-[#7a7a7a]">hs</span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-semibold text-sm text-[#1d1d1f]">
                            {apt.pet?.name}
                          </span>
                          <span className="text-xs text-[#7a7a7a]">
                            ({apt.pet?.species} • {apt.pet?.breed})
                          </span>
                          <Badge variant={statusVariantMap[apt.status] || "gray"} size="sm">
                            {statusLabelMap[apt.status] || apt.status}
                          </Badge>
                        </div>
                        <div className="text-xs text-[#333333] mt-1 font-medium">
                          {serviceLabelMap[apt.serviceType] || apt.serviceType}:{" "}
                          <span className="text-[#7a7a7a] font-normal">{apt.reason}</span>
                        </div>
                        <div className="text-[11px] text-[#8e8e93] mt-0.5 flex items-center gap-2">
                          <span>Dueño: {apt.owner?.fullName}</span>
                          {apt.vet && <span>• Atiende: {apt.vet.name}</span>}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <a
                        href={whatsappUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
                        title="Enviar recordatorio por WhatsApp"
                      >
                        <MessageCircle className="w-3.5 h-3.5" />
                        Recordar
                      </a>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Panel lateral: Alertas de Stock & Pacientes Alérgicos */}
        <div className="space-y-6">
          {/* Stock Alerts Card */}
          <div className="bg-white rounded-3xl border border-[#e5e5ea] p-6 shadow-xs">
            <div className="flex items-center justify-between pb-3 border-b border-[#f0f0f0]">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-[#ff9500]" />
                <h4 className="font-semibold text-sm text-[#1d1d1f]">
                  Alertas de Stock Crítico
                </h4>
              </div>
              <Link
                href="/dashboard/inventario"
                className="text-[11px] font-semibold text-[#0066cc] hover:underline"
              >
                Inventario
              </Link>
            </div>

            <div className="divide-y divide-[#f0f0f0] mt-2">
              {lowStockItems.length === 0 ? (
                <div className="py-6 text-center text-xs text-[#7a7a7a]">
                  Todos los insumos superan el umbral mínimo.
                </div>
              ) : (
                lowStockItems.map((item) => (
                  <div key={item.id} className="py-3 flex items-center justify-between">
                    <div>
                      <div className="text-xs font-semibold text-[#1d1d1f]">{item.name}</div>
                      <div className="text-[11px] text-[#7a7a7a]">
                        Mínimo req: {item.minStock} {item.unit}
                      </div>
                    </div>
                    <Badge variant="red" size="sm">
                      {item.currentStock} {item.unit}
                    </Badge>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Quick Pet Safety Card (Allergies) */}
          <div className="bg-white rounded-3xl border border-[#e5e5ea] p-6 shadow-xs">
            <div className="flex items-center gap-2 pb-3 border-b border-[#f0f0f0]">
              <PawPrint className="w-4 h-4 text-[#0066cc]" />
              <h4 className="font-semibold text-sm text-[#1d1d1f]">
                Pacientes con Alergias Clínicas
              </h4>
            </div>

            <div className="divide-y divide-[#f0f0f0] mt-2">
              {pets
                .filter((p) => p.allergies && p.allergies.trim() !== "")
                .slice(0, 3)
                .map((pet) => (
                  <div key={pet.id} className="py-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-[#1d1d1f]">{pet.name}</span>
                      <Badge variant="red" size="sm">
                        Alérgico
                      </Badge>
                    </div>
                    <p className="text-[11px] text-[#ff3b30] mt-1 bg-[#ff3b30]/5 p-2 rounded-lg font-medium">
                      ⚠️ {pet.allergies}
                    </p>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
