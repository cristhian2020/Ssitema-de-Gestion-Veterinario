import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDate(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date);
}

export function formatTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (isNaN(date.getTime())) return "—";

  return new Intl.DateTimeFormat("es-AR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(date);
}

export function formatDateTime(dateInput: Date | string | null | undefined): string {
  if (!dateInput) return "—";
  return `${formatDate(dateInput)} a las ${formatTime(dateInput)} hs`;
}

export function formatCurrency(amount: number | string | null | undefined): string {
  if (amount === null || amount === undefined) return "$0";
  const val = typeof amount === "string" ? parseFloat(amount) : amount;
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(val);
}

export function cleanPhoneNumber(phone: string): string {
  return phone.replace(/[^\d]/g, "");
}

/**
 * Genera el enlace directo para enviar recordatorio de cita por WhatsApp
 */
export function generateWhatsAppReminderLink(params: {
  phone: string;
  ownerName: string;
  petName: string;
  dateStr: string;
  timeStr: string;
  serviceName: string;
}): string {
  const cleanPhone = cleanPhoneNumber(params.phone);
  const message = `🐾 *Veterinaria Huellitas Felices* 🐾
¡Hola ${params.ownerName}! Te recordamos la cita para tu mascota *${params.petName}*:

📅 *Fecha:* ${params.dateStr}
⏰ *Hora:* ${params.timeStr} hs
🩺 *Servicio:* ${params.serviceName}
📍 *Ubicación:* Av. Santa Fe 3421, Palermo

¿Nos confirmas tu asistencia respondiendo a este mensaje? ¡Te esperamos!`;

  return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
}

/**
 * Genera el enlace para emergencias 24/7 de la veterinaria
 */
export function generateEmergencyWhatsAppLink(): string {
  const clinicPhone = "59162640539";
  const message = `🚨 *URGENCIA VETERINARIA 24/7 - Huellitas Felices* 🚨
Hola, necesito atención de urgencia para mi mascota.`;

  return `https://wa.me/${clinicPhone}?text=${encodeURIComponent(message)}`;
}
