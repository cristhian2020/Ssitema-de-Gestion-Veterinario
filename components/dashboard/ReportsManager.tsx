"use client";

import * as React from "react";
import {
  BarChart3,
  Download,
  FileSpreadsheet,
  TrendingUp,
  PawPrint,
  DollarSign,
  Package,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  PieChart,
  ArrowDownToLine,
  Sparkles,
} from "lucide-react";
import { type PetWithOwner } from "@/lib/actions/pets";
import { type InventoryItemWithAlert } from "@/lib/actions/inventory";
import { type AppointmentWithDetails } from "@/lib/actions/appointments";
import { type PaymentWithDetails } from "@/lib/actions/billing";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

interface ReportsManagerProps {
  pets: PetWithOwner[];
  inventory: InventoryItemWithAlert[];
  appointments: AppointmentWithDetails[];
  payments: PaymentWithDetails[];
}

export function ReportsManager({
  pets,
  inventory,
  appointments,
  payments,
}: ReportsManagerProps) {
  const { toast } = useToast();

  // Metrics calculations
  const totalIncome = payments
    .filter((p) => p.status === "paid")
    .reduce((acc, curr) => acc + (parseFloat(curr.amount) || 0), 0);

  const totalInventoryValue = inventory.reduce(
    (acc, curr) => acc + (parseFloat(curr.salePrice) || 0) * curr.currentStock,
    0
  );

  const completedAppointments = appointments.filter((a) => a.status === "completed").length;
  const appointmentCompletionRate =
    appointments.length > 0
      ? Math.round((completedAppointments / appointments.length) * 100)
      : 100;

  // Species breakdown
  const speciesCounts = pets.reduce((acc, p) => {
    acc[p.species] = (acc[p.species] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Payment methods breakdown
  const paymentMethodsTotal = payments.reduce((acc, p) => {
    const val = parseFloat(p.amount) || 0;
    acc[p.paymentMethod] = (acc[p.paymentMethod] || 0) + val;
    return acc;
  }, {} as Record<string, number>);

  // Helper for CSV downloading with UTF-8 BOM
  const downloadCsv = (filename: string, headers: string[], rows: (string | number)[][]) => {
    try {
      const escapeCell = (val: string | number | undefined | null) => {
        if (val === null || val === undefined) return '""';
        const str = String(val).replace(/"/g, '""');
        return `"${str}"`;
      };

      const csvContent =
        "\uFEFF" +
        [
          headers.map(escapeCell).join(";"),
          ...rows.map((row) => row.map(escapeCell).join(";")),
        ].join("\r\n");

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${filename}_${new Date().toISOString().split("T")[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      toast(`Archivo ${filename}.csv descargado con éxito`, "success");
    } catch {
      toast("Error al generar el archivo Excel / CSV", "error");
    }
  };

  const exportPets = () => {
    const headers = [
      "ID",
      "Nombre Mascota",
      "Especie",
      "Raza",
      "Sexo",
      "Peso (kg)",
      "Nº Microchip ISO",
      "Alergias Clínicas",
      "Dueño / Propietario",
      "Teléfono Dueño",
      "Email Dueño",
      "Dirección",
      "Fecha de Registro",
    ];

    const rows = pets.map((p) => [
      p.id,
      p.name,
      p.species,
      p.breed,
      p.sex,
      p.weightKg || "",
      p.microchip || "Sin chip",
      p.allergies || "Sin alergias",
      p.owner?.fullName || "",
      p.owner?.phone || "",
      p.owner?.email || "",
      p.owner?.address || "",
      formatDate(p.createdAt),
    ]);

    downloadCsv("Listado_Pacientes_Huellitas", headers, rows);
  };

  const exportInventory = () => {
    const headers = [
      "ID",
      "SKU",
      "Nombre del Producto",
      "Categoría",
      "Stock Actual",
      "Stock Mínimo",
      "Unidad",
      "Costo Unitario ($)",
      "Precio Venta ($)",
      "Valuación en Stock ($)",
      "Vencimiento",
      "Estado",
    ];

    const rows = inventory.map((i) => [
      i.id,
      i.sku,
      i.name,
      i.category,
      i.currentStock,
      i.minStock,
      i.unit,
      i.unitCost,
      i.salePrice,
      (parseFloat(i.salePrice) * i.currentStock).toFixed(2),
      i.expiryDate || "N/A",
      i.isLowStock ? "STOCK CRÍTICO" : "NORMAL",
    ]);

    downloadCsv("Inventario_Valorizado_Huellitas", headers, rows);
  };

  const exportPayments = () => {
    const headers = [
      "ID",
      "Nº Recibo",
      "Fecha y Hora",
      "Cliente / Titular",
      "Mascota",
      "Concepto",
      "Medio de Pago",
      "Monto ($)",
      "Estado",
      "Notas",
    ];

    const methodLabels: Record<string, string> = {
      cash: "Efectivo",
      card: "Tarjeta",
      transfer_qr: "Transferencia / QR",
    };

    const rows = payments.map((p) => [
      p.id,
      p.invoiceNumber || "",
      formatDateTime(p.createdAt),
      p.owner?.fullName || "",
      p.pet?.name || "",
      p.concept,
      methodLabels[p.paymentMethod] || p.paymentMethod,
      p.amount,
      p.status === "paid" ? "Cobrado" : p.status,
      p.notes || "",
    ]);

    downloadCsv("Libro_Caja_Ingresos_Huellitas", headers, rows);
  };

  const exportAppointments = () => {
    const headers = [
      "ID",
      "Fecha y Hora",
      "Mascota",
      "Dueño",
      "Teléfono",
      "Veterinario Asignado",
      "Tipo de Servicio",
      "Estado",
      "Motivo",
      "Duración (Min)",
    ];

    const serviceLabels: Record<string, string> = {
      general: "Consulta General",
      vaccine: "Vacunación",
      surgery: "Cirugía",
      emergency: "Urgencia 24/7",
      grooming: "Estética & Spa",
    };

    const statusLabels: Record<string, string> = {
      pending: "Pendiente",
      in_progress: "En Consulta",
      completed: "Finalizada",
      cancelled: "Cancelada",
    };

    const rows = appointments.map((a) => [
      a.id,
      formatDateTime(a.scheduledAt),
      a.pet?.name || "",
      a.owner?.fullName || "",
      a.owner?.phone || "",
      a.vet?.name || "No asignado",
      serviceLabels[a.serviceType] || a.serviceType,
      statusLabels[a.status] || a.status,
      a.reason || "",
      a.durationMinutes,
    ]);

    downloadCsv("Historial_Citas_Huellitas", headers, rows);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            Reportes Clínicos & Exportación Excel
          </h2>
          <p className="text-sm text-[#7a7a7a]">
            Auditoría financiera, métricas de rendimiento y descarga de bases de datos
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="blue" size="md">
            <Sparkles className="w-3.5 h-3.5" />
            Exportación UTF-8 compatible con Excel & Sheets
          </Badge>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium mb-2">
            <span>Total Recaudado</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{formatCurrency(totalIncome)}</div>
          <div className="text-[11px] text-emerald-600 font-semibold mt-1">
            ✓ {payments.length} transacciones
          </div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium mb-2">
            <span>Pacientes Registrados</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <PawPrint className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{pets.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">Historiales activos</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium mb-2">
            <span>Inventario Valorizado</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Package className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f]">
            {formatCurrency(totalInventoryValue)}
          </div>
          <div className="text-[11px] text-slate-500 mt-1">{inventory.length} productos en stock</div>
        </div>

        <div className="bg-white p-5 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium mb-2">
            <span>Cumplimiento de Citas</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CalendarCheck className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{appointmentCompletionRate}%</div>
          <div className="text-[11px] text-indigo-600 font-semibold mt-1">
            {completedAppointments} de {appointments.length} finalizadas
          </div>
        </div>
      </div>

      {/* Export Center Section (Highlight of this module) */}
      <div className="bg-gradient-to-br from-white to-blue-50/40 rounded-3xl p-6 border border-blue-100 shadow-xs">
        <div className="flex items-center gap-2.5 mb-2">
          <FileSpreadsheet className="w-5 h-5 text-blue-600" />
          <h3 className="font-bold text-base text-slate-900">Centro de Exportación de Datos</h3>
        </div>
        <p className="text-xs text-slate-500 mb-5 max-w-2xl leading-relaxed">
          Descarga en formato CSV delimitado por punto y coma (;) con codificación UTF-8 BOM, ideal para abrir directamente con doble clic en Microsoft Excel sin problemas de tildes ni caracteres especiales.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button
            type="button"
            onClick={exportPets}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <PawPrint className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Base de Pacientes
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-tight">
              Mascotas, razas, microchips, dueños y teléfonos.
            </p>
          </button>

          <button
            type="button"
            onClick={exportInventory}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <Package className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Inventario Valorizado
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-tight">
              Stock actual, costos, precios de venta y alertas.
            </p>
          </button>

          <button
            type="button"
            onClick={exportPayments}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <DollarSign className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Libro de Caja & Cobros
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-tight">
              Historial de recibos, métodos de pago e importes.
            </p>
          </button>

          <button
            type="button"
            onClick={exportAppointments}
            className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-blue-400 hover:shadow-md transition-all text-left group cursor-pointer"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center group-hover:scale-105 transition-transform">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <Download className="w-4 h-4 text-slate-400 group-hover:text-blue-600 transition-colors" />
            </div>
            <h4 className="font-bold text-sm text-slate-900 group-hover:text-blue-600 transition-colors">
              Historial de Turnos
            </h4>
            <p className="text-[11px] text-slate-500 mt-1 leading-tight">
              Citas atendidas, canceladas y veterinarios asignados.
            </p>
          </button>
        </div>
      </div>

      {/* Visual Breakdowns */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Breakdown 1: Species */}
        <div className="bg-white p-6 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-[#1d1d1f]">Distribución de Pacientes</h4>
            <span className="text-xs text-slate-400">Por especie animal</span>
          </div>

          <div className="space-y-3">
            {Object.entries(speciesCounts).map(([species, count]) => {
              const pct = Math.round((count / (pets.length || 1)) * 100);
              return (
                <div key={species}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{species}</span>
                    <span>
                      {count} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-blue-600 rounded-full transition-all duration-500"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Breakdown 2: Payment Methods */}
        <div className="bg-white p-6 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-bold text-base text-[#1d1d1f]">Ingresos por Medio de Pago</h4>
            <span className="text-xs text-slate-400">Total recaudado</span>
          </div>

          <div className="space-y-3">
            {[
              { id: "cash", label: "Efectivo en Mostrador", color: "bg-emerald-500" },
              { id: "card", label: "Tarjetas de Débito / Crédito", color: "bg-blue-600" },
              { id: "transfer_qr", label: "Transferencia / QR", color: "bg-purple-600" },
            ].map((m) => {
              const val = paymentMethodsTotal[m.id] || 0;
              const pct = totalIncome > 0 ? Math.round((val / totalIncome) * 100) : 0;
              return (
                <div key={m.id}>
                  <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                    <span>{m.label}</span>
                    <span>
                      {formatCurrency(val)} ({pct}%)
                    </span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${m.color} rounded-full transition-all duration-500`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
