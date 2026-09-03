"use client";

import * as React from "react";
import { Calendar, CheckCircle2, PawPrint, Clock, User, Phone, Mail } from "lucide-react";
import { bookPublicAppointmentAction } from "@/lib/actions/appointments";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";

interface PublicBookingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function PublicBookingModal({ isOpen, onClose }: PublicBookingModalProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSuccess, setIsSuccess] = React.useState(false);

  // Form State
  const [ownerName, setOwnerName] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [petName, setPetName] = React.useState("");
  const [species, setSpecies] = React.useState("Perro");
  const [serviceType, setServiceType] = React.useState<"general" | "vaccine" | "surgery" | "emergency" | "grooming">("general");
  const [preferredDate, setPreferredDate] = React.useState("");
  const [preferredTime, setPreferredTime] = React.useState("10:00");
  const [reason, setReason] = React.useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await bookPublicAppointmentAction({
        ownerName,
        phone,
        email,
        petName,
        species,
        serviceType,
        preferredDate,
        preferredTime,
        reason,
      });

      if (res.success) {
        setIsSuccess(true);
        toast(res.message || "¡Turno solicitado con éxito!", "success");
      } else {
        toast(res.error || "Error al procesar la reserva", "error");
      }
    } catch {
      toast("Error de conexión al enviar la reserva", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setIsSuccess(false);
    onClose();
    setOwnerName("");
    setPhone("");
    setEmail("");
    setPetName("");
    setReason("");
    setPreferredDate("");
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleReset}
      title={isSuccess ? "¡Reserva Confirmada!" : "Solicitar Cita en Huellitas Felices"}
      description={
        isSuccess
          ? "Hemos recibido tu solicitud y nos comunicaremos a la brevedad."
          : "Sin complicaciones: agenda la atención para tu mascota en menos de 1 minuto."
      }
      maxWidth="md"
    >
      {isSuccess ? (
        <div className="py-6 text-center space-y-4">
          <div className="w-16 h-16 rounded-full bg-[#34c759]/10 text-[#34c759] flex items-center justify-center mx-auto">
            <CheckCircle2 className="w-10 h-10" />
          </div>
          <h4 className="text-xl font-bold text-[#1d1d1f]">
            ¡Muchas gracias, {ownerName}!
          </h4>
          <p className="text-sm text-[#7a7a7a] max-w-sm mx-auto leading-relaxed">
            La cita para <strong>{petName}</strong> ha quedado pre-agendada para el{" "}
            <strong>{preferredDate}</strong> a las <strong>{preferredTime} hs</strong>. Te
            enviaremos la confirmación oficial a tu WhatsApp <strong>{phone}</strong>.
          </p>
          <div className="pt-4">
            <Button variant="primary" size="md" onClick={handleReset}>
              Entendido
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="bg-[#f5f5f7] p-3.5 rounded-2xl space-y-1 mb-2">
            <span className="text-[11px] font-semibold text-[#0066cc] uppercase tracking-wider block">
              1. Datos del Propietario
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Input
                placeholder="Tu nombre completo"
                value={ownerName}
                onChange={(e) => setOwnerName(e.target.value)}
                required
              />
              <Input
                placeholder="WhatsApp (ej: +54 9 11...)"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
            </div>
            <div className="pt-2">
              <Input
                placeholder="Correo electrónico"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="bg-[#f5f5f7] p-3.5 rounded-2xl space-y-1">
            <span className="text-[11px] font-semibold text-[#0066cc] uppercase tracking-wider block">
              2. Datos del Paciente (Mascota)
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
              <Input
                placeholder="Nombre de tu mascota"
                value={petName}
                onChange={(e) => setPetName(e.target.value)}
                required
              />
              <Select
                value={species}
                onChange={(e) => setSpecies(e.target.value)}
                required
              >
                <option value="Perro">Perro</option>
                <option value="Gato">Gato</option>
                <option value="Ave">Ave</option>
                <option value="Exótico">Exótico / Roedor</option>
              </Select>
            </div>
          </div>

          <div className="space-y-3">
            <Select
              label="Tipo de Consulta / Servicio Requerido"
              value={serviceType}
              onChange={(e) => setServiceType(e.target.value as any)}
              required
            >
              <option value="general">Consulta Médica General</option>
              <option value="vaccine">Vacunación / Desparasitación</option>
              <option value="surgery">Cirugía / Esterilización</option>
              <option value="emergency">Urgencia Médica Inmediata</option>
              <option value="grooming">Peluquería Canina & Baño</option>
            </Select>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <Input
                label="Fecha Preferida"
                type="date"
                value={preferredDate}
                onChange={(e) => setPreferredDate(e.target.value)}
                required
              />

              <Select
                label="Franja Horaria"
                value={preferredTime}
                onChange={(e) => setPreferredTime(e.target.value)}
                required
              >
                <option value="09:00">09:00 hs (Mañana)</option>
                <option value="10:30">10:30 hs (Mañana)</option>
                <option value="12:00">12:00 hs (Mediodía)</option>
                <option value="14:30">14:30 hs (Tarde)</option>
                <option value="16:00">16:00 hs (Tarde)</option>
                <option value="17:30">17:30 hs (Tarde)</option>
                <option value="19:00">19:00 hs (Vespertino)</option>
              </Select>
            </div>

            <Textarea
              label="Motivo o Síntomas Notados"
              placeholder="Ej: Tiene tos, no come desde ayer, o sólo control preventivo..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={2}
              required
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-3 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Enviando..." : "Confirmar Solicitud de Cita"}
            </Button>
          </div>
        </form>
      )}
    </Modal>
  );
}
