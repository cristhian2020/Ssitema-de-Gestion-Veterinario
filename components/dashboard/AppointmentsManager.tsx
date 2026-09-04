"use client";

import * as React from "react";
import {
  CalendarDays,
  Clock,
  Plus,
  MessageCircle,
  CheckCircle,
  PlayCircle,
  XCircle,
  Search,
  Filter,
  UserCheck,
  PawPrint,
} from "lucide-react";
import {
  type AppointmentWithDetails,
  createAppointmentAction,
  updateAppointmentStatusAction,
} from "@/lib/actions/appointments";
import { type PetWithOwner } from "@/lib/actions/pets";
import { type User } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatTime, generateWhatsAppReminderLink } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface AppointmentsManagerProps {
  initialAppointments: AppointmentWithDetails[];
  pets: PetWithOwner[];
  vets: User[];
}

export function AppointmentsManager({
  initialAppointments,
  pets,
  vets,
}: AppointmentsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [appointments, setAppointments] = React.useState(initialAppointments);
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [statusFilter, setStatusFilter] = React.useState<string>("all");
  const [typeFilter, setTypeFilter] = React.useState<string>("all");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form state
  const [selectedPetId, setSelectedPetId] = React.useState<string>("");
  const [selectedVetId, setSelectedVetId] = React.useState<string>("");
  const [serviceType, setServiceType] = React.useState<string>("general");
  const [scheduledAt, setScheduledAt] = React.useState<string>("");
  const [durationMinutes, setDurationMinutes] = React.useState<number>(30);
  const [reason, setReason] = React.useState<string>("");
  const [notes, setNotes] = React.useState<string>("");

  // Sync state if props update
  React.useEffect(() => {
    setAppointments(initialAppointments);
  }, [initialAppointments]);

  const serviceLabels: Record<string, string> = {
    general: "Consulta General",
    vaccine: "Vacunación",
    surgery: "Cirugía",
    emergency: "Urgencia 24/7",
    grooming: "Peluquería / Estética",
  };

  const statusVariantMap: Record<string, "blue" | "green" | "amber" | "red" | "gray"> = {
    pending: "amber",
    in_progress: "blue",
    completed: "green",
    cancelled: "red",
  };

  const statusLabels: Record<string, string> = {
    pending: "Pendiente",
    in_progress: "En Consulta",
    completed: "Finalizada",
    cancelled: "Cancelada",
  };

  const filteredAppointments = appointments.filter((apt) => {
    const matchesSearch =
      apt.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.owner?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      apt.reason.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    const matchesType = typeFilter === "all" || apt.serviceType === typeFilter;

    return matchesSearch && matchesStatus && matchesType;
  });

  const handleStatusChange = async (
    appointmentId: number,
    newStatus: "pending" | "in_progress" | "completed" | "cancelled"
  ) => {
    try {
      const res = await updateAppointmentStatusAction(appointmentId, newStatus);
      if (res.success) {
        setAppointments((prev) =>
          prev.map((a) => (a.id === appointmentId ? { ...a, status: newStatus } : a))
        );
        toast(`Estado de la cita actualizado a: ${statusLabels[newStatus]}`, "success");
      } else {
        toast(res.error || "Error al actualizar estado", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  };

  const handleCreateAppointment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) {
      toast("Selecciona una mascota", "error");
      return;
    }

    const pet = pets.find((p) => p.id === Number(selectedPetId));
    if (!pet) {
      toast("Mascota no encontrada", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createAppointmentAction({
        petId: Number(selectedPetId),
        ownerId: pet.ownerId,
        vetId: selectedVetId ? Number(selectedVetId) : undefined,
        serviceType,
        scheduledAt,
        durationMinutes,
        reason,
        notes,
      });

      if (res.success && res.appointment) {
        toast("¡Cita agendada correctamente!", "success");
        const vet = vets.find((v) => v.id === (selectedVetId ? Number(selectedVetId) : undefined));
        const newApt: AppointmentWithDetails = {
          ...res.appointment,
          pet: pet,
          owner: pet.owner,
          vet: vet || null,
        } as AppointmentWithDetails;
        setAppointments((prev) => [newApt, ...prev]);
        router.refresh();
        setIsModalOpen(false);
        // Reset form
        setSelectedPetId("");
        setSelectedVetId("");
        setReason("");
        setNotes("");
        setScheduledAt("");

        // Si se generó enlace WhatsApp, ofrecer abrirlo
        if (res.whatsappLink) {
          setTimeout(() => {
            const confirmOpen = window.confirm(
              "¿Deseas abrir WhatsApp para enviar la confirmación al dueño ahora?"
            );
            if (confirmOpen) window.open(res.whatsappLink!, "_blank");
          }, 300);
        }
      } else {
        toast(res.error || "Error al programar la cita", "error");
      }
    } catch (err: any) {
      toast(err.message || "Error al procesar la cita", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            Gestión de Citas y Reservas
          </h2>
          <p className="text-sm text-[#7a7a7a]">
            Calendario de turnos, estados clínicos y recordatorios automáticos por WhatsApp
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Agendar Nueva Cita
        </Button>
      </div>

      {/* Filters Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5ea] flex flex-col md:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8e8e93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por paciente, propietario o motivo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f5f5f7] text-sm text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f] border-none focus:ring-2 focus:ring-[#0066cc]/20 cursor-pointer"
          >
            <option value="all">Todos los Estados</option>
            <option value="pending">Pendientes</option>
            <option value="in_progress">En Consulta</option>
            <option value="completed">Finalizadas</option>
            <option value="cancelled">Canceladas</option>
          </select>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="h-10 px-3 rounded-xl bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f] border-none focus:ring-2 focus:ring-[#0066cc]/20 cursor-pointer"
          >
            <option value="all">Todos los Servicios</option>
            <option value="general">Consulta General</option>
            <option value="vaccine">Vacunación</option>
            <option value="surgery">Cirugía</option>
            <option value="emergency">Urgencias</option>
            <option value="grooming">Peluquería</option>
          </select>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-3xl border border-[#e5e5ea] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#f0f0f0] flex items-center justify-between">
          <div className="text-xs font-semibold uppercase tracking-wider text-[#8e8e93]">
            {filteredAppointments.length} Cita(s) Registrada(s)
          </div>
        </div>

        <div className="divide-y divide-[#f0f0f0]">
          {filteredAppointments.length === 0 ? (
            <div className="py-16 text-center">
              <CalendarDays className="w-10 h-10 text-[#d2d2d7] mx-auto mb-3" />
              <p className="text-sm font-medium text-[#1d1d1f]">
                No se encontraron citas con los filtros seleccionados
              </p>
              <p className="text-xs text-[#7a7a7a] mt-1">
                Ajusta los filtros o crea una nueva cita para comenzar.
              </p>
            </div>
          ) : (
            filteredAppointments.map((apt) => {
              const whatsappUrl = generateWhatsAppReminderLink({
                phone: apt.owner?.whatsapp || "",
                ownerName: apt.owner?.fullName || "",
                petName: apt.pet?.name || "",
                dateStr: formatDate(apt.scheduledAt),
                timeStr: formatTime(apt.scheduledAt),
                serviceName: serviceLabels[apt.serviceType] || apt.serviceType,
              });

              return (
                <div
                  key={apt.id}
                  className="p-5 hover:bg-[#fafafc] transition-colors flex flex-col lg:flex-row lg:items-center justify-between gap-4"
                >
                  {/* Date & Main Info */}
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-[#0066cc]/5 border border-[#0066cc]/10 flex flex-col items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-[#0066cc]">
                        {formatTime(apt.scheduledAt)}
                      </span>
                      <span className="text-[10px] text-[#7a7a7a]">
                        {formatDate(apt.scheduledAt).split(" ")[0]}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center gap-2.5 flex-wrap">
                        <span className="text-base font-semibold text-[#1d1d1f]">
                          {apt.pet?.name}
                        </span>
                        <span className="text-xs text-[#7a7a7a]">
                          ({apt.pet?.species} • {apt.pet?.breed})
                        </span>
                        <Badge variant={statusVariantMap[apt.status] || "gray"} size="sm">
                          {statusLabels[apt.status] || apt.status}
                        </Badge>
                        <Badge variant="purple" size="sm">
                          {serviceLabels[apt.serviceType] || apt.serviceType}
                        </Badge>
                      </div>

                      <p className="text-sm text-[#333333] mt-1.5 font-medium">
                        Motivo: <span className="font-normal text-[#1d1d1f]">{apt.reason}</span>
                      </p>

                      <div className="flex items-center gap-4 mt-2 text-xs text-[#7a7a7a] flex-wrap">
                        <span>
                          Propietario:{" "}
                          <strong className="text-[#1d1d1f] font-medium">
                            {apt.owner?.fullName}
                          </strong>{" "}
                          ({apt.owner?.phone})
                        </span>
                        {apt.vet && (
                          <span>
                            Veterinario:{" "}
                            <strong className="text-[#1d1d1f] font-medium">
                              {apt.vet.name}
                            </strong>
                          </span>
                        )}
                        <span>Duración: {apt.durationMinutes} min</span>
                      </div>
                    </div>
                  </div>

                  {/* Quick Status and WhatsApp Actions */}
                  <div className="flex items-center gap-2 self-end lg:self-center flex-wrap">
                    {/* Botón WhatsApp */}
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-all border border-[#25D366]/20"
                      title="Enviar recordatorio automático de WhatsApp"
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                      Recordatorio WA
                    </a>

                    {/* Status Changer Buttons */}
                    {apt.status === "pending" && (
                      <button
                        onClick={() => handleStatusChange(apt.id, "in_progress")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#0066cc]/10 text-[#0066cc] hover:bg-[#0066cc]/20 transition-colors"
                      >
                        <PlayCircle className="w-3.5 h-3.5" />
                        Iniciar Consulta
                      </button>
                    )}

                    {apt.status === "in_progress" && (
                      <button
                        onClick={() => handleStatusChange(apt.id, "completed")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium bg-[#34c759]/10 text-[#248a3d] hover:bg-[#34c759]/20 transition-colors"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        Finalizar
                      </button>
                    )}

                    {apt.status !== "cancelled" && apt.status !== "completed" && (
                      <button
                        onClick={() => handleStatusChange(apt.id, "cancelled")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-medium text-[#ff3b30] hover:bg-[#ff3b30]/10 transition-colors"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        Cancelar
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* Modal Agendar Nueva Cita */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agendar Nueva Cita Médica"
        description="Selecciona la mascota, el horario y el servicio clínico para verificar disponibilidad"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateAppointment} className="space-y-4">
          <Select
            label="Paciente (Mascota)"
            value={selectedPetId}
            onChange={(e) => setSelectedPetId(e.target.value)}
            required
          >
            <option value="">Selecciona una mascota registrada...</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species} - {p.breed}) — Dueño: {p.owner?.fullName}
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tipo de Servicio"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value)}
              required
            >
              <option value="general">Consulta General</option>
              <option value="vaccine">Vacunación / Desparasitación</option>
              <option value="surgery">Cirugía Programada</option>
              <option value="emergency">Atención de Urgencia 24/7</option>
              <option value="grooming">Peluquería Canina / Baño</option>
            </Select>

            <Select
              label="Veterinario Asignado"
              value={selectedVetId}
              onChange={(e) => setSelectedVetId(e.target.value)}
            >
              <option value="">Cualquier profesional disponible</option>
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.specialty || "Veterinario"})
                </option>
              ))}
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Fecha y Hora del Turno"
              type="datetime-local"
              value={scheduledAt}
              onChange={(e) => setScheduledAt(e.target.value)}
              required
            />

            <Select
              label="Duración Estimada"
              value={durationMinutes}
              onChange={(e) => setDurationMinutes(Number(e.target.value))}
            >
              <option value={15}>15 minutos (Control rápido)</option>
              <option value={30}>30 minutos (Consulta estándar)</option>
              <option value={45}>45 minutos (Examen exhaustivo)</option>
              <option value={60}>60 minutos (Procedimiento/Estética)</option>
              <option value={90}>90 minutos (Cirugía)</option>
            </Select>
          </div>

          <Input
            label="Motivo de la Cita"
            placeholder="Ej: Vacunación anual, cojera en pata delantera..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />

          <Textarea
            label="Notas Internas o Indicaciones Previas"
            placeholder="Ej: Requiere ayuno de 8 horas, traer muestra de orina..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t border-[#f0f0f0]">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Comprobando disponibilidad..." : "Confirmar y Agendar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
