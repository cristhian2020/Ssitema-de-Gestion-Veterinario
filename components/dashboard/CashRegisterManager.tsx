"use client";

import * as React from "react";
import {
  CreditCard,
  DollarSign,
  Plus,
  Receipt,
  Search,
  Printer,
  CheckCircle2,
  Calendar,
  Smartphone,
  Wallet,
  ArrowUpRight,
  User,
  PawPrint,
  Clock,
  Filter,
} from "lucide-react";
import { type PaymentWithDetails, createPaymentAction } from "@/lib/actions/billing";
import { type Owner, type Pet } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface CashRegisterManagerProps {
  initialPayments: PaymentWithDetails[];
  owners: Owner[];
  pets: Pet[];
  summary: {
    total: number;
    cash: number;
    card: number;
    transfer: number;
    count: number;
  };
}

export function CashRegisterManager({
  initialPayments,
  owners,
  pets,
  summary: initialSummary,
}: CashRegisterManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [paymentsList, setPaymentsList] = React.useState(initialPayments);
  const [summary, setSummary] = React.useState(initialSummary);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [methodFilter, setMethodFilter] = React.useState("all");

  // Modals
  const [isPayModalOpen, setIsPayModalOpen] = React.useState(false);
  const [selectedReceipt, setSelectedReceipt] = React.useState<PaymentWithDetails | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New Payment Form
  const [ownerId, setOwnerId] = React.useState("");
  const [petId, setPetId] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [paymentMethod, setPaymentMethod] = React.useState<"cash" | "card" | "transfer_qr">("cash");
  const [concept, setConcept] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // Filter pets by selected owner
  const availablePets = React.useMemo(() => {
    if (!ownerId) return [];
    return pets.filter((p) => p.ownerId === Number(ownerId));
  }, [ownerId, pets]);

  const filteredPayments = paymentsList.filter((p) => {
    const matchesSearch =
      p.concept.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.owner?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.invoiceNumber && p.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesMethod = methodFilter === "all" || p.paymentMethod === methodFilter;
    return matchesSearch && matchesMethod;
  });

  const handleCreatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId) {
      toast("Selecciona el propietario responsable", "error");
      return;
    }
    if (!concept) {
      toast("Ingresa el concepto del cobro", "error");
      return;
    }
    if (!amount || Number(amount) <= 0) {
      toast("Ingresa un monto válido", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createPaymentAction({
        ownerId: Number(ownerId),
        petId: petId ? Number(petId) : undefined,
        amount: Number(amount),
        paymentMethod,
        concept,
        notes: notes || undefined,
        status: "paid",
      });

      if (res.success && res.payment) {
        toast("¡Cobro registrado y comprobante emitido!", "success");
        setPaymentsList((prev) => [res.payment!, ...prev]);

        // Optimistic summary update
        const val = Number(amount);
        setSummary((prev) => ({
          ...prev,
          total: prev.total + val,
          cash: paymentMethod === "cash" ? prev.cash + val : prev.cash,
          card: paymentMethod === "card" ? prev.card + val : prev.card,
          transfer: paymentMethod === "transfer_qr" ? prev.transfer + val : prev.transfer,
          count: prev.count + 1,
        }));

        router.refresh();
        setIsPayModalOpen(false);
        setSelectedReceipt(res.payment);

        // Reset
        setOwnerId("");
        setPetId("");
        setAmount("");
        setConcept("");
        setNotes("");
      } else {
        toast(res.error || "No se pudo registrar el cobro", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePrintReceipt = (receipt: PaymentWithDetails) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    const methodLabels = {
      cash: "Efectivo",
      card: "Tarjeta de Débito / Crédito",
      transfer_qr: "Transferencia / QR",
    };

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Comprobante de Pago - ${receipt.invoiceNumber}</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #1d1d1f; max-width: 550px; margin: 0 auto; }
            .ticket { border: 1px dashed #bbb; padding: 30px; border-radius: 12px; }
            .header { text-align: center; border-bottom: 2px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px; }
            .brand { font-size: 20px; font-weight: bold; color: #0066cc; }
            .subtitle { font-size: 12px; color: #666; margin-top: 4px; }
            .invoice-tag { display: inline-block; background: #eef5ff; color: #0066cc; padding: 4px 10px; border-radius: 20px; font-size: 12px; font-weight: bold; margin-top: 10px; }
            .row { display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 8px; }
            .label { color: #777; }
            .value { font-weight: 600; text-align: right; }
            .total-box { margin-top: 20px; padding-top: 15px; border-top: 2px solid #1d1d1f; display: flex; justify-content: space-between; align-items: center; }
            .total-label { font-size: 16px; font-weight: bold; }
            .total-val { font-size: 22px; font-weight: bold; color: #0066cc; }
            .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #888; border-top: 1px solid #eee; padding-top: 15px; }
          </style>
        </head>
        <body>
          <div class="ticket">
            <div class="header">
              <div class="brand">🐾 HUELLITAS FELICES VETERINARIA</div>
              <div class="subtitle">Av. Santa Fe 3421, Palermo | Emergencias: +591 62640539</div>
              <div class="invoice-tag">${receipt.invoiceNumber || "COMPROBANTE OFICIAL"}</div>
            </div>

            <div class="row">
              <span class="label">Fecha y Hora:</span>
              <span class="value">${formatDateTime(receipt.createdAt)}</span>
            </div>
            <div class="row">
              <span class="label">Cliente / Dueño:</span>
              <span class="value">${receipt.owner?.fullName || "Cliente General"}</span>
            </div>
            ${
              receipt.pet
                ? `<div class="row">
                    <span class="label">Paciente atendido:</span>
                    <span class="value">${receipt.pet.name} (${receipt.pet.species})</span>
                  </div>`
                : ""
            }
            <div class="row">
              <span class="label">Medio de Pago:</span>
              <span class="value">${methodLabels[receipt.paymentMethod as keyof typeof methodLabels] || receipt.paymentMethod}</span>
            </div>
            <div class="row">
              <span class="label">Estado:</span>
              <span class="value" style="color: #248a3d;">✓ PAGADO</span>
            </div>

            <div style="margin-top: 15px; padding-top: 10px; border-top: 1px solid #eee;">
              <div class="row">
                <span class="label">Detalle / Concepto:</span>
                <span class="value" style="max-width: 250px;">${receipt.concept}</span>
              </div>
              ${
                receipt.notes
                  ? `<div class="row"><span class="label">Observaciones:</span><span class="value">${receipt.notes}</span></div>`
                  : ""
              }
            </div>

            <div class="total-box">
              <span class="total-label">TOTAL ABONADO:</span>
              <span class="total-val">${formatCurrency(receipt.amount)}</span>
            </div>

            <div class="footer">
              ¡Gracias por confiar la salud de tu mascota a Huellitas Felices!<br>
              Comprobante no válido como factura fiscal.
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
    }, 250);
  };

  const methodIcons = {
    cash: Wallet,
    card: CreditCard,
    transfer_qr: Smartphone,
  };

  const methodNames = {
    cash: "Efectivo",
    card: "Tarjeta",
    transfer_qr: "Transferencia / QR",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            Caja Diaria & Facturación
          </h2>
          <p className="text-sm text-[#7a7a7a]">
            Control de ingresos, cobros de consultas y emisión de comprobantes de pago
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsPayModalOpen(true)}>
          <Plus className="w-4 h-4" />
          Registrar Nuevo Cobro
        </Button>
      </div>

      {/* Metric Cards - Cash summary */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Total Today */}
        <div className="bg-white p-5 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium mb-2">
            <span>Total Recaudado Hoy</span>
            <div className="w-8 h-8 rounded-xl bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{formatCurrency(summary.total)}</div>
          <div className="text-[11px] text-[#248a3d] font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {summary.count} operaciones registradas
          </div>
        </div>

        {/* Card 2: Cash */}
        <div className="bg-white p-5 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium mb-2">
            <span>Efectivo en Caja</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Wallet className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{formatCurrency(summary.cash)}</div>
          <div className="text-[11px] text-[#7a7a7a] mt-1">Cobros físicos en mostrador</div>
        </div>

        {/* Card 3: Card */}
        <div className="bg-white p-5 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium mb-2">
            <span>Tarjetas (POS)</span>
            <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
              <CreditCard className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{formatCurrency(summary.card)}</div>
          <div className="text-[11px] text-[#7a7a7a] mt-1">Débito y Crédito</div>
        </div>

        {/* Card 4: Transfer QR */}
        <div className="bg-white p-5 rounded-3xl border border-[#e5e5ea] shadow-xs">
          <div className="flex items-center justify-between text-xs text-[#8e8e93] font-medium mb-2">
            <span>Transferencias / QR</span>
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <Smartphone className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-[#1d1d1f]">{formatCurrency(summary.transfer)}</div>
          <div className="text-[11px] text-[#7a7a7a] mt-1">Billeteras electrónicas</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#e5e5ea] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8e8e93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por cliente, concepto o recibo..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-2xl bg-[#f5f5f7] text-xs text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#7a7a7a] font-medium">Medio de Pago:</span>
          <select
            value={methodFilter}
            onChange={(e) => setMethodFilter(e.target.value)}
            className="h-10 px-3 rounded-2xl bg-[#f5f5f7] text-xs font-semibold text-[#1d1d1f] border-none focus:ring-2 focus:ring-[#0066cc]/20 cursor-pointer"
          >
            <option value="all">Todos los Medios</option>
            <option value="cash">Efectivo</option>
            <option value="card">Tarjetas</option>
            <option value="transfer_qr">Transferencias / QR</option>
          </select>
        </div>
      </div>

      {/* Transactions List */}
      <div className="bg-white rounded-3xl border border-[#e5e5ea] shadow-xs overflow-hidden">
        <div className="p-5 border-b border-[#f0f0f0] flex items-center justify-between">
          <h3 className="font-semibold text-base text-[#1d1d1f]">
            Registro de Movimientos ({filteredPayments.length})
          </h3>
          <span className="text-xs text-[#8e8e93]">Ordenado por fecha más reciente</span>
        </div>

        {filteredPayments.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="font-semibold text-sm text-slate-700">No hay movimientos registrados</p>
            <p className="text-xs text-slate-400 mt-1">
              Haz clic en "Registrar Nuevo Cobro" para asentar el primer pago del día.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-[#f5f5f7]">
            {filteredPayments.map((p) => {
              const Icon = methodIcons[p.paymentMethod as keyof typeof methodIcons] || Wallet;
              return (
                <div
                  key={p.id}
                  className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fafafc] transition-colors"
                >
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-700 flex items-center justify-center shrink-0 border border-slate-200">
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#1d1d1f]">{p.concept}</span>
                        {p.invoiceNumber && (
                          <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-100">
                            {p.invoiceNumber}
                          </span>
                        )}
                        <Badge variant="green" size="sm">
                          Cobrado
                        </Badge>
                      </div>

                      <div className="text-xs text-[#7a7a7a] mt-1 flex items-center gap-3 flex-wrap">
                        <span className="flex items-center gap-1 font-medium text-slate-800">
                          <User className="w-3 h-3 text-slate-400" />
                          {p.owner?.fullName || "Cliente"}
                        </span>
                        {p.pet && (
                          <span className="flex items-center gap-1 text-slate-600">
                            <PawPrint className="w-3 h-3 text-slate-400" />
                            {p.pet.name} ({p.pet.species})
                          </span>
                        )}
                        <span>• {methodNames[p.paymentMethod as keyof typeof methodNames]}</span>
                        <span>• {formatDateTime(p.createdAt)}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-3 shrink-0">
                    <div className="text-right">
                      <div className="text-base sm:text-lg font-bold text-[#1d1d1f]">
                        {formatCurrency(p.amount)}
                      </div>
                      <div className="text-[10px] text-emerald-600 font-medium">Acreditado</div>
                    </div>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintReceipt(p)}
                      title="Imprimir ticket de comprobante"
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0066cc]" />
                      <span className="hidden md:inline">Recibo</span>
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Modal: Registrar Cobro */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Registrar Nuevo Cobro en Caja"
        description="Ingresa el importe abonado por el propietario y emite el comprobante oficial."
      >
        <form onSubmit={handleCreatePayment} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
              Dueño / Propietario *
            </label>
            <Select
              value={ownerId}
              onChange={(e) => {
                setOwnerId(e.target.value);
                setPetId("");
              }}
              required
            >
              <option value="">Selecciona al cliente responsable...</option>
              {owners.map((o) => (
                <option key={o.id} value={o.id}>
                  {o.fullName} ({o.phone})
                </option>
              ))}
            </Select>
          </div>

          {availablePets.length > 0 && (
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Mascota Atendida (Opcional)
              </label>
              <Select value={petId} onChange={(e) => setPetId(e.target.value)}>
                <option value="">Selecciona la mascota...</option>
                {availablePets.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.species} - {p.breed})
                  </option>
                ))}
              </Select>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
              Concepto del Cobro *
            </label>
            <Input
              type="text"
              placeholder="Ej: Consulta General, Vacuna Séxtuple, Medicamento..."
              value={concept}
              onChange={(e) => setConcept(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Monto a Cobrar ($) *
              </label>
              <Input
                type="number"
                step="0.01"
                min="1"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Medio de Pago *
              </label>
              <Select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value as any)}
              >
                <option value="cash">Efectivo en Caja</option>
                <option value="card">Tarjeta de Débito / Crédito</option>
                <option value="transfer_qr">Transferencia Bancaria / QR</option>
              </Select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
              Notas u Observaciones (Opcional)
            </label>
            <Input
              type="text"
              placeholder="Ej: Descuento 10% por dos mascotas, pago en 1 cuota..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f0f0f0]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsPayModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? "Procesando Cobro..." : "Confirmar & Emitir Recibo"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Comprobante Reciente */}
      {selectedReceipt && (
        <Modal
          isOpen={Boolean(selectedReceipt)}
          onClose={() => setSelectedReceipt(null)}
          title="Cobro Realizado con Éxito"
          description={`Comprobante emitido con el número ${selectedReceipt.invoiceNumber}`}
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 text-xs space-y-2">
              <div className="flex justify-between font-medium">
                <span className="text-slate-500">Recibo Nº:</span>
                <span className="font-mono font-bold text-blue-600">{selectedReceipt.invoiceNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Cliente:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.owner?.fullName}</span>
              </div>
              {selectedReceipt.pet && (
                <div className="flex justify-between">
                  <span className="text-slate-500">Mascota:</span>
                  <span className="font-semibold text-slate-800">{selectedReceipt.pet.name}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-slate-500">Concepto:</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.concept}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Medio:</span>
                <span className="font-semibold text-slate-800">
                  {methodNames[selectedReceipt.paymentMethod as keyof typeof methodNames]}
                </span>
              </div>
              <div className="pt-2 border-t border-slate-200 flex justify-between items-center text-sm font-bold">
                <span>Total Cobrado:</span>
                <span className="text-blue-600 text-base">{formatCurrency(selectedReceipt.amount)}</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="md"
                onClick={() => handlePrintReceipt(selectedReceipt)}
              >
                <Printer className="w-4 h-4 text-blue-600" />
                Imprimir Comprobante
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => setSelectedReceipt(null)}
              >
                Finalizar
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
