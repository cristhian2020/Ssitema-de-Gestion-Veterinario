"use client";

import * as React from "react";
import {
  FileText,
  Plus,
  Activity,
  Calendar,
  CheckCircle2,
  AlertCircle,
  Clock,
  Printer,
  Stethoscope,
  Pill,
  Thermometer,
  Weight,
  Search,
  Edit3,
  Lock,
  PawPrint,
  ShieldAlert,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/components/providers/AuthProvider";
import {
  type MedicalRecordWithDetails,
  type VaccineWithPet,
  createMedicalRecordAction,
  updateMedicalRecordAction,
  createVaccineAction,
  updateVaccineAction,
  updateVaccineStatusAction,
} from "@/lib/actions/medical-records";
import { type PetWithOwner } from "@/lib/actions/pets";
import { type User } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatDate, formatDateTime } from "@/lib/utils";
import { useRouter } from "next/navigation";

interface MedicalRecordsManagerProps {
  initialRecords: MedicalRecordWithDetails[];
  initialVaccines: VaccineWithPet[];
  pets: PetWithOwner[];
  vets: User[];
}

export function MedicalRecordsManager({
  initialRecords,
  initialVaccines,
  pets,
  vets,
}: MedicalRecordsManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isReceptionist, isAdmin } = useAuth();
  const [activeTab, setActiveTab] = React.useState<"records" | "vaccines">("records");
  const [records, setRecords] = React.useState(initialRecords);
  const [vaccines, setVaccines] = React.useState(initialVaccines);
  const [searchTerm, setSearchTerm] = React.useState("");

  // Modals & Edit State
  const [isRecordModalOpen, setIsRecordModalOpen] = React.useState(false);
  const [isVaccineModalOpen, setIsVaccineModalOpen] = React.useState(false);
  const [editingRecordId, setEditingRecordId] = React.useState<number | null>(null);
  const [editingVaccineId, setEditingVaccineId] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New/Edit Record Form State
  const [selectedPetId, setSelectedPetId] = React.useState("");
  const [selectedVetId, setSelectedVetId] = React.useState("");
  const [reason, setReason] = React.useState("");
  const [symptoms, setSymptoms] = React.useState("");
  const [diagnosis, setDiagnosis] = React.useState("");
  const [treatment, setTreatment] = React.useState("");
  const [prescription, setPrescription] = React.useState("");
  const [weightKg, setWeightKg] = React.useState("");
  const [temperatureC, setTemperatureC] = React.useState("");
  const [internalNotes, setInternalNotes] = React.useState("");

  // New/Edit Vaccine Form State
  const [vaccinePetId, setVaccinePetId] = React.useState("");
  const [vaccineName, setVaccineName] = React.useState("");
  const [vaccineType, setVaccineType] = React.useState<"vaccine" | "deworming">("vaccine");
  const [dose, setDose] = React.useState("Refuerzo Anual");
  const [batchNumber, setBatchNumber] = React.useState("");
  const [nextDueDate, setNextDueDate] = React.useState("");
  const [vaccineStatus, setVaccineStatus] = React.useState<"pending" | "applied" | "expired">("pending");

  const filteredRecords = records.filter(
    (r) =>
      r.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.diagnosis.toLowerCase().includes(searchTerm.toLowerCase()) ||
      r.reason.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredVaccines = vaccines.filter(
    (v) =>
      v.pet?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenNewRecordModal = () => {
    setEditingRecordId(null);
    setSelectedPetId("");
    setSelectedVetId("");
    setReason("");
    setSymptoms("");
    setDiagnosis("");
    setTreatment("");
    setPrescription("");
    setWeightKg("");
    setTemperatureC("");
    setInternalNotes("");
    setIsRecordModalOpen(true);
  };

  const handleEditRecord = (record: MedicalRecordWithDetails) => {
    setEditingRecordId(record.id);
    setSelectedPetId(String(record.petId));
    setSelectedVetId(record.vetId ? String(record.vetId) : "");
    setReason(record.reason);
    setSymptoms(record.symptoms);
    setDiagnosis(record.diagnosis);
    setTreatment(record.treatment);
    setPrescription(record.prescription || "");
    setWeightKg(record.weightKg || "");
    setTemperatureC(record.temperatureC || "");
    setInternalNotes(record.internalNotes || "");
    setIsRecordModalOpen(true);
  };

  const handleOpenNewVaccineModal = () => {
    setEditingVaccineId(null);
    setVaccinePetId("");
    setVaccineName("");
    setVaccineType("vaccine");
    setDose("Refuerzo Anual");
    setBatchNumber("");
    setNextDueDate("");
    setVaccineStatus("pending");
    setIsVaccineModalOpen(true);
  };

  const handleEditVaccine = (vac: VaccineWithPet) => {
    setEditingVaccineId(vac.id);
    setVaccinePetId(String(vac.petId));
    setVaccineName(vac.name);
    setVaccineType(vac.type as "vaccine" | "deworming");
    setDose(vac.dose || "Refuerzo Anual");
    setBatchNumber(vac.batchNumber || "");
    setNextDueDate(vac.nextDueDate ? new Date(vac.nextDueDate).toISOString().split("T")[0] : "");
    setVaccineStatus(vac.status as "pending" | "applied" | "expired");
    setIsVaccineModalOpen(true);
  };

  const handleRecordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPetId) {
      toast("Selecciona una mascota", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingRecordId) {
        const res = await updateMedicalRecordAction(editingRecordId, {
          petId: Number(selectedPetId),
          vetId: selectedVetId ? Number(selectedVetId) : undefined,
          reason,
          symptoms,
          diagnosis,
          treatment,
          prescription: prescription || undefined,
          weightKg: weightKg || undefined,
          temperatureC: temperatureC || undefined,
          internalNotes: internalNotes || undefined,
        });

        if (res.success && res.record) {
          toast("Historia clínica actualizada correctamente", "success");
          setRecords((prev) =>
            prev.map((r) =>
              r.id === editingRecordId
                ? ({
                    ...r,
                    ...res.record,
                    pet: pets.find((p) => p.id === Number(selectedPetId)) || r.pet,
                    vet: vets.find((v) => v.id === Number(selectedVetId)) || r.vet,
                  } as MedicalRecordWithDetails)
                : r
            )
          );
          setIsRecordModalOpen(false);
          setEditingRecordId(null);
        } else {
          toast(res.error || "Error al actualizar la consulta", "error");
        }
      } else {
        const res = await createMedicalRecordAction({
          petId: Number(selectedPetId),
          vetId: selectedVetId ? Number(selectedVetId) : undefined,
          reason,
          symptoms,
          diagnosis,
          treatment,
          prescription: prescription || undefined,
          weightKg: weightKg || undefined,
          temperatureC: temperatureC || undefined,
          internalNotes: internalNotes || undefined,
        });

        if (res.success && res.record) {
          toast("Consulta médica registrada en la historia clínica", "success");
          const pet = pets.find((p) => p.id === Number(selectedPetId));
          const vet = vets.find((v) => v.id === (selectedVetId ? Number(selectedVetId) : undefined));
          const newRecordWithDetails: MedicalRecordWithDetails = {
            ...res.record,
            pet: pet || null,
            vet: vet || null,
          } as MedicalRecordWithDetails;
          setRecords((prev) => [newRecordWithDetails, ...prev]);
          router.refresh();
          setIsRecordModalOpen(false);
        } else {
          toast(res.error || "Error al registrar la consulta", "error");
        }
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVaccineSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!vaccinePetId) {
      toast("Selecciona una mascota", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingVaccineId) {
        const res = await updateVaccineAction(editingVaccineId, {
          petId: Number(vaccinePetId),
          name: vaccineName,
          type: vaccineType,
          dose,
          batchNumber: batchNumber || undefined,
          nextDueDate,
          status: vaccineStatus,
        });

        if (res.success && res.vaccine) {
          toast("Vacuna / Antiparasitario actualizado correctamente", "success");
          setVaccines((prev) =>
            prev.map((v) =>
              v.id === editingVaccineId
                ? ({
                    ...v,
                    ...res.vaccine,
                    pet: pets.find((p) => p.id === Number(vaccinePetId)) || v.pet,
                  } as VaccineWithPet)
                : v
            )
          );
          router.refresh();
          setIsVaccineModalOpen(false);
          setEditingVaccineId(null);
        } else {
          toast(res.error || "Error al actualizar vacuna", "error");
        }
      } else {
        const res = await createVaccineAction({
          petId: Number(vaccinePetId),
          name: vaccineName,
          type: vaccineType,
          dose,
          batchNumber: batchNumber || undefined,
          nextDueDate,
          status: vaccineStatus,
        });

        if (res.success && res.vaccine) {
          toast("Vacuna / Antiparasitario programado con éxito", "success");
          const pet = pets.find((p) => p.id === Number(vaccinePetId));
          const newVaccineWithPet: VaccineWithPet = {
            ...res.vaccine,
            pet: pet || null,
          } as VaccineWithPet;
          setVaccines((prev) => [newVaccineWithPet, ...prev]);
          router.refresh();
          setIsVaccineModalOpen(false);
        } else {
          toast(res.error || "Error al programar vacuna", "error");
        }
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleVaccineApplied = async (vaccineId: number, currentStatus: string) => {
    const newStatus = currentStatus === "applied" ? "pending" : "applied";
    try {
      const res = await updateVaccineStatusAction(vaccineId, newStatus);
      if (res.success) {
        setVaccines((prev) =>
          prev.map((v) => (v.id === vaccineId ? { ...v, status: newStatus } : v))
        );
        toast(`Estado actualizado a: ${newStatus === "applied" ? "Aplicada" : "Pendiente"}`, "success");
      } else {
        toast(res.error || "Error al actualizar", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  };

  const handlePrintRecord = (record: MedicalRecordWithDetails) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Receta Médica - ${record.pet?.name} (Huellitas Felices)</title>
          <style>
            body { font-family: -apple-system, system-ui, sans-serif; padding: 40px; color: #1d1d1f; max-width: 700px; margin: 0 auto; }
            .header { border-bottom: 2px solid #0066cc; padding-bottom: 15px; margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; }
            .brand { font-size: 20px; font-weight: bold; color: #0066cc; }
            .details { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 13px; margin-bottom: 20px; background: #f5f5f7; padding: 15px; border-radius: 10px; }
            .section-title { font-size: 14px; font-weight: bold; color: #0066cc; text-transform: uppercase; margin-top: 20px; margin-bottom: 8px; border-bottom: 1px solid #e0e0e0; padding-bottom: 4px; }
            .content { font-size: 14px; line-height: 1.5; margin-bottom: 15px; white-space: pre-wrap; }
            .prescription-box { background: #fff8eb; border: 1px solid #ffe0b2; padding: 15px; border-radius: 10px; font-size: 14px; line-height: 1.6; }
            .footer { margin-top: 50px; text-align: center; border-top: 1px solid #ccc; padding-top: 20px; font-size: 12px; color: #777; }
          </style>
        </head>
        <body>
          <div class="header">
            <div>
              <div class="brand">🐾 VETERINARIA HUELLITAS FELICES</div>
              <div style="font-size: 12px; color: #666;">Dirección: Av. Santa Fe 3421, Palermo | Emergencias: +591 62640539</div>
            </div>
            <div style="font-size: 12px; text-align: right;">
              <strong>Fecha:</strong> ${formatDate(record.createdAt)}<br>
              <strong>Ficha Nº:</strong> #${record.id}
            </div>
          </div>

          <div class="details">
            <div><strong>Paciente:</strong> ${record.pet?.name} (${record.pet?.species} - ${record.pet?.breed})</div>
            <div><strong>Veterinario a cargo:</strong> ${record.vet?.name || "Equipo Veterinario"}</div>
            <div><strong>Peso en consulta:</strong> ${record.weightKg ? record.weightKg + " kg" : "No registrado"}</div>
            <div><strong>Temperatura:</strong> ${record.temperatureC ? record.temperatureC + " °C" : "No registrada"}</div>
          </div>

          <div class="section-title">Diagnóstico Clínico</div>
          <div class="content">${record.diagnosis}</div>

          <div class="section-title">Tratamiento e Indicaciones Médicas</div>
          <div class="content">${record.treatment}</div>

          ${
            record.prescription
              ? `
            <div class="section-title">Receta Médica & Posología</div>
            <div class="prescription-box">${record.prescription}</div>
          `
              : ""
          }

          <div class="footer">
            <p>Firma y Matrícula Profesional: ____________________________________</p>
            <p>Documento oficial emitido por el Sistema de Gestión Clínica Huellitas Felices.</p>
          </div>
          <script>
            window.onload = function() { window.print(); }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            Historial Clínico & Vacunación
          </h2>
          <p className="text-sm text-[#7a7a7a]">
            Consultas médicas, diagnósticos, recetas imprimibles y calendario biológico
          </p>
        </div>

        <div className="flex items-center gap-2">
          {activeTab === "records" ? (
            !isReceptionist ? (
              <Button
                variant="primary"
                size="md"
                onClick={handleOpenNewRecordModal}
              >
                <Plus className="w-4 h-4" />
                Nueva Consulta Médica
              </Button>
            ) : (
              <div className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-100/90 rounded-2xl text-xs text-slate-500 font-medium border border-slate-200">
                <Lock className="w-3.5 h-3.5 text-slate-400" />
                <span>Consultas clínicas reservadas a Veterinarios/Admin</span>
              </div>
            )
          ) : (
            <Button
              variant="primary"
              size="md"
              onClick={handleOpenNewVaccineModal}
            >
              <Plus className="w-4 h-4" />
              Programar Vacuna
            </Button>
          )}
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-[#e5e5ea] shadow-xs">
        {/* Apple Pill Tabs */}
        <div className="flex items-center bg-[#f5f5f7] p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("records")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "records"
                ? "bg-white text-[#0066cc] shadow-xs"
                : "text-[#7a7a7a] hover:text-[#1d1d1f]"
            }`}
          >
            Consultas Clínicas ({records.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("vaccines")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "vaccines"
                ? "bg-white text-[#0066cc] shadow-xs"
                : "text-[#7a7a7a] hover:text-[#1d1d1f]"
            }`}
          >
            Vacunas & Desparasitación ({vaccines.length})
          </button>
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="w-4 h-4 text-[#8e8e93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por paciente o diagnóstico..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#f5f5f7] text-xs text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
          />
        </div>
      </div>

      {/* TAB 1: CONSULTAS CLÍNICAS */}
      {activeTab === "records" && (
        <div className="space-y-4">
          {filteredRecords.length === 0 ? (
            <div className="bg-white rounded-3xl border border-[#e5e5ea] p-12 text-center">
              <FileText className="w-10 h-10 text-[#d2d2d7] mx-auto mb-3" />
              <p className="text-sm font-semibold text-[#1d1d1f]">
                No hay consultas clínicas registradas
              </p>
              <p className="text-xs text-[#7a7a7a] mt-1">
                Haz clic en "Nueva Consulta Médica" para ingresar la primera atención.
              </p>
            </div>
          ) : (
            filteredRecords.map((record) => (
              <div
                key={record.id}
                className="bg-white rounded-3xl border border-[#e5e5ea] p-6 shadow-xs hover:shadow-md transition-all space-y-4"
              >
                {/* Header consultation */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#f0f0f0]">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center font-bold text-sm">
                      {record.pet?.name.charAt(0)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-base text-[#1d1d1f]">
                          {record.pet?.name}
                        </span>
                        <span className="text-xs text-[#7a7a7a]">
                          ({record.pet?.species} • {record.pet?.breed})
                        </span>
                      </div>
                      <div className="text-xs text-[#7a7a7a]">
                        Atendido por:{" "}
                        <strong className="text-[#1d1d1f] font-medium">
                          {record.vet?.name || "Veterinario de Turno"}
                        </strong>{" "}
                        • {formatDateTime(record.createdAt)}
                      </div>
                    </div>
                  </div>

                  {/* Actions: Edit & Print */}
                  <div className="flex items-center gap-2">
                    {!isReceptionist && (
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditRecord(record)}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#0066cc]" />
                        Editar Ficha
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePrintRecord(record)}
                    >
                      <Printer className="w-3.5 h-3.5 text-[#0066cc]" />
                      Imprimir Receta
                    </Button>
                  </div>
                </div>

                {/* Vitals summary bar */}
                <div className="flex items-center gap-4 bg-[#f5f5f7] p-3 rounded-2xl text-xs text-[#1d1d1f] flex-wrap">
                  <div className="flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-[#0066cc]" />
                    <span>
                      Motivo: <strong>{record.reason}</strong>
                    </span>
                  </div>
                  {record.weightKg && (
                    <div className="flex items-center gap-1.5">
                      <Weight className="w-3.5 h-3.5 text-[#0066cc]" />
                      <span>
                        Peso: <strong>{record.weightKg} kg</strong>
                      </span>
                    </div>
                  )}
                  {record.temperatureC && (
                    <div className="flex items-center gap-1.5">
                      <Thermometer className="w-3.5 h-3.5 text-[#ff3b30]" />
                      <span>
                        Temperatura: <strong>{record.temperatureC} °C</strong>
                      </span>
                    </div>
                  )}
                </div>

                {/* Symptoms & Diagnosis */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-2xl bg-[#fafafc] border border-[#f0f0f0]">
                    <span className="font-semibold text-[#8e8e93] uppercase tracking-wider block mb-1">
                      Síntomas & Hallazgos
                    </span>
                    <p className="text-sm text-[#1d1d1f] leading-relaxed">{record.symptoms}</p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-[#fafafc] border border-[#f0f0f0]">
                    <span className="font-semibold text-[#0066cc] uppercase tracking-wider block mb-1">
                      Diagnóstico Definitivo / Presuntivo
                    </span>
                    <p className="text-sm font-medium text-[#1d1d1f] leading-relaxed">
                      {record.diagnosis}
                    </p>
                  </div>
                </div>

                {/* Treatment & Prescription */}
                <div className="p-4 rounded-2xl bg-white border border-[#e5e5ea] space-y-2">
                  <div className="text-xs font-semibold uppercase tracking-wider text-[#1d1d1f]">
                    Plan Terapéutico & Tratamiento
                  </div>
                  <p className="text-sm text-[#333333] leading-relaxed">{record.treatment}</p>

                  {record.prescription && (
                    <div className="mt-3 pt-3 border-t border-[#f0f0f0]">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#0066cc] mb-1">
                        <Pill className="w-3.5 h-3.5" />
                        Receta Médica & Posología
                      </div>
                      <p className="text-xs font-mono bg-[#f5f5f7] p-3 rounded-xl text-[#1d1d1f] whitespace-pre-wrap">
                        {record.prescription}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* TAB 2: VACUNAS & DESPARASITACIÓN */}
      {activeTab === "vaccines" && (
        <div className="bg-white rounded-3xl border border-[#e5e5ea] shadow-xs overflow-hidden">
          <div className="divide-y divide-[#f0f0f0]">
            {filteredVaccines.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#7a7a7a]">
                No hay vacunas o desparasitaciones registradas.
              </div>
            ) : (
              filteredVaccines.map((v) => {
                const statusBadgeVariant =
                  v.status === "applied" ? "green" : v.status === "expired" ? "red" : "amber";
                const statusLabel =
                  v.status === "applied"
                    ? "Aplicada"
                    : v.status === "expired"
                    ? "Vencida"
                    : "Pendiente";

                return (
                  <div
                    key={v.id}
                    className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-[#fafafc] transition-colors"
                  >
                    <div className="flex items-start gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-[#0066cc]/10 text-[#0066cc] flex items-center justify-center shrink-0">
                        <Activity className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-[#1d1d1f]">{v.name}</span>
                          <span className="text-xs text-[#7a7a7a]">
                            ({v.pet?.name} • {v.pet?.species})
                          </span>
                          <Badge variant={statusBadgeVariant} size="sm">
                            {statusLabel}
                          </Badge>
                          <Badge variant="purple" size="sm">
                            {v.type === "vaccine" ? "Vacuna" : "Antiparasitario"}
                          </Badge>
                        </div>
                        <div className="text-xs text-[#7a7a7a] mt-1">
                          Dosis: <strong className="text-[#1d1d1f]">{v.dose}</strong>
                          {v.batchNumber && <span> • Lote: {v.batchNumber}</span>}
                        </div>
                        <div className="text-xs text-[#8e8e93] mt-0.5">
                          Próximo vencimiento:{" "}
                          <strong className="text-[#1d1d1f] font-medium">
                            {formatDate(v.nextDueDate)}
                          </strong>
                          {v.appliedAt && <span> (Aplicada el {formatDate(v.appliedAt)})</span>}
                        </div>
                      </div>
                    </div>

                    {/* Vaccine actions: Edit & Status */}
                    <div className="flex items-center gap-2 self-end sm:self-center">
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => handleEditVaccine(v)}
                      >
                        <Edit3 className="w-3.5 h-3.5 text-[#0066cc]" />
                        Editar
                      </Button>
                      <Button
                        variant={v.status === "applied" ? "secondary" : "primary"}
                        size="sm"
                        onClick={() => handleToggleVaccineApplied(v.id, v.status)}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        {v.status === "applied" ? "Marcar Pendiente" : "Marcar Aplicada"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}

      {/* Modal Nueva / Editar Consulta Médica */}
      <Modal
        isOpen={isRecordModalOpen}
        onClose={() => {
          setIsRecordModalOpen(false);
          setEditingRecordId(null);
        }}
        title={editingRecordId ? `Editar Consulta Médica #${editingRecordId}` : "Nueva Consulta Médica"}
        description={
          editingRecordId
            ? "Actualiza diagnósticos, indicaciones médicas o signos vitales"
            : "Registra síntomas, diagnóstico, prescripción farmacológica y signos vitales"
        }
        maxWidth="xl"
      >
        <form onSubmit={handleRecordSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Paciente (Mascota)"
              value={selectedPetId}
              onChange={(e) => {
                const newId = e.target.value;
                setSelectedPetId(newId);
                if (!editingRecordId && newId) {
                  const found = pets.find((p) => String(p.id) === String(newId));
                  if (found && found.weightKg && found.weightKg !== "0.0" && found.weightKg !== "0") {
                    setWeightKg(found.weightKg);
                  }
                }
              }}
              required
            >
              <option value="">Selecciona paciente...</option>
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species} - {p.breed})
                </option>
              ))}
            </Select>

            <Select
              label="Veterinario a Cargo"
              value={selectedVetId}
              onChange={(e) => setSelectedVetId(e.target.value)}
            >
              <option value="">Profesional de turno...</option>
              {vets.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.name} ({v.specialty || "Veterinario"})
                </option>
              ))}
            </Select>
          </div>

          {/* Ficha Resumen Clínico Auto-cargada del Paciente */}
          {(() => {
            const petData = pets.find((p) => String(p.id) === String(selectedPetId));
            if (!petData) return null;
            return (
              <div className="bg-linear-to-br from-[#0066cc]/5 via-white to-slate-50 border border-[#0066cc]/20 rounded-2xl p-4 space-y-2.5 shadow-xs transition-all animate-in fade-in-50">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-[#0066cc] text-white flex items-center justify-center font-bold shadow-xs">
                      <PawPrint className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <h4 className="font-bold text-base text-[#1d1d1f] leading-tight">
                          {petData.name}
                        </h4>
                        <Badge variant="blue" size="sm">
                          {petData.species}
                        </Badge>
                        <Badge variant="gray" size="sm">
                          {petData.breed}
                        </Badge>
                        <Badge variant="purple" size="sm">
                          {petData.sex}
                        </Badge>
                        {petData.birthDate && (
                          <span className="text-[11px] text-[#7a7a7a]">
                            • Nac: {formatDate(petData.birthDate)}
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-[#7a7a7a] mt-0.5 block">
                        Tutor: <strong className="text-[#1d1d1f]">{petData.owner?.fullName}</strong> • Tel: {petData.owner?.phone}
                      </span>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] uppercase font-semibold text-[#8e8e93] block">Peso en Ficha</span>
                    <span className="font-bold text-sm text-[#0066cc]">
                      {petData.weightKg && petData.weightKg !== "0.0" ? `${petData.weightKg} kg` : "Por registrar"}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-2 border-t border-black/5 text-[11px]">
                  <div>
                    <span className="text-[#8e8e93] block">Microchip ISO:</span>
                    <span className="font-mono text-[#1d1d1f]">
                      {petData.microchip || "Sin microchip"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8e8e93] block">Dirección Tutor:</span>
                    <span className="text-[#1d1d1f] truncate block">
                      {petData.owner?.address || "No especificada"}
                    </span>
                  </div>
                  <div>
                    <span className="text-[#8e8e93] block">Datos Clínicos:</span>
                    <span className="text-emerald-700 font-medium">Auto-cargados al formulario</span>
                  </div>
                </div>

                {petData.allergies ? (
                  <div className="bg-red-500/10 border border-red-200 text-red-700 px-3 py-2 rounded-xl flex items-center gap-2 text-xs">
                    <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
                    <div>
                      <strong className="font-semibold">¡ALERTA MÉDICA / ALERGIAS!:</strong> {petData.allergies}
                    </div>
                  </div>
                ) : (
                  <div className="text-[11px] text-[#8e8e93] flex items-center gap-1.5 pt-1 border-t border-black/5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Sin alergias reportadas en ficha previa. Puedes ajustar los signos vitales abajo.</span>
                  </div>
                )}
              </div>
            );
          })()}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-1">
              <Input
                label="Peso en Consulta (kg)"
                placeholder="Ej: 28.5"
                value={weightKg}
                onChange={(e) => setWeightKg(e.target.value)}
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                label="Temperatura (°C)"
                placeholder="Ej: 38.6"
                value={temperatureC}
                onChange={(e) => setTemperatureC(e.target.value)}
              />
            </div>
            <div className="sm:col-span-1">
              <Input
                label="Motivo General"
                placeholder="Ej: Cojera aguda"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                required
              />
            </div>
          </div>

          <Textarea
            label="Síntomas y Examen Clínico"
            placeholder="Detalla auscultación, dolor a la palpación, mucosas, estado general..."
            value={symptoms}
            onChange={(e) => setSymptoms(e.target.value)}
            rows={2}
            required
          />

          <Textarea
            label="Diagnóstico Presuntivo / Definitivo"
            placeholder="Ej: Otitis externa bacteriana en oído derecho..."
            value={diagnosis}
            onChange={(e) => setDiagnosis(e.target.value)}
            rows={2}
            required
          />

          <Textarea
            label="Tratamiento & Indicaciones"
            placeholder="Limpieza de canal auditivo, reposo, control en 7 días..."
            value={treatment}
            onChange={(e) => setTreatment(e.target.value)}
            rows={2}
            required
          />

          <Textarea
            label="Receta Médica & Posología (Para el Dueño)"
            placeholder="Ej: Gotas óticas 3 gotas cada 12 horas por 10 días. Meloxicam 0.5%..."
            value={prescription}
            onChange={(e) => setPrescription(e.target.value)}
            rows={3}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsRecordModalOpen(false);
                setEditingRecordId(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : editingRecordId
                ? "Guardar Cambios"
                : "Guardar Consulta"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Programar / Editar Vacuna */}
      <Modal
        isOpen={isVaccineModalOpen}
        onClose={() => {
          setIsVaccineModalOpen(false);
          setEditingVaccineId(null);
        }}
        title={editingVaccineId ? "Editar Vacuna / Antiparasitario" : "Programar Vacunación o Desparasitación"}
        description={
          editingVaccineId
            ? "Modifica lote, próxima dosis o estado del biológico"
            : "Registra la fecha límite y el tipo de biológico para el paciente"
        }
        maxWidth="md"
      >
        <form onSubmit={handleVaccineSubmit} className="space-y-4">
          <Select
            label="Paciente (Mascota)"
            value={vaccinePetId}
            onChange={(e) => setVaccinePetId(e.target.value)}
            required
          >
            <option value="">Selecciona paciente...</option>
            {pets.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name} ({p.species} - {p.breed})
              </option>
            ))}
          </Select>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Tipo de Biológico"
              value={vaccineType}
              onChange={(e) => setVaccineType(e.target.value as "vaccine" | "deworming")}
              required
            >
              <option value="vaccine">Vacuna</option>
              <option value="deworming">Desparasitación Interna/Externa</option>
            </Select>

            <Input
              label="Dosis"
              placeholder="Ej: Refuerzo Anual, 1ra Dosis..."
              value={dose}
              onChange={(e) => setDose(e.target.value)}
              required
            />
          </div>

          <Input
            label="Nombre del Biológico o Medicamento"
            placeholder="Ej: Antirrábica, Séxtuple Vanguard, Pipeta Frontline..."
            value={vaccineName}
            onChange={(e) => setVaccineName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Fecha Programada / Vencimiento"
              type="date"
              value={nextDueDate}
              onChange={(e) => setNextDueDate(e.target.value)}
              required
            />

            <Input
              label="Número de Lote (Opcional)"
              placeholder="Ej: LOT-2026-B8"
              value={batchNumber}
              onChange={(e) => setBatchNumber(e.target.value)}
            />
          </div>

          <Select
            label="Estado Inicial"
            value={vaccineStatus}
            onChange={(e) => setVaccineStatus(e.target.value as any)}
          >
            <option value="pending">Pendiente de aplicación</option>
            <option value="applied">Ya aplicada hoy</option>
            <option value="expired">Vencida</option>
          </Select>

          <div className="pt-4 flex items-center justify-end gap-3 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsVaccineModalOpen(false);
                setEditingVaccineId(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : editingVaccineId
                ? "Guardar Cambios"
                : "Programar"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
