"use client";

import * as React from "react";
import Link from "next/link";
import {
  PawPrint,
  Search,
  Calendar,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Clock,
  QrCode,
  Heart,
  Phone,
  MessageCircle,
  FileText,
  User,
  ArrowRight,
  ExternalLink,
  Sparkles,
} from "lucide-react";
import { lookupPetCardAction } from "@/lib/actions/client-portal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicBookingModal } from "@/components/landing/PublicBookingModal";
import { formatDate, formatDateTime, generateEmergencyWhatsAppLink } from "@/lib/utils";

export function PetCardPortal() {
  const [query, setQuery] = React.useState("");
  const [isPending, startTransition] = React.useTransition();
  const [results, setResults] = React.useState<any[] | null>(null);
  const [errorMessage, setErrorMessage] = React.useState("");
  const [selectedPetIndex, setSelectedPetIndex] = React.useState(0);
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);

  const emergencyLink = generateEmergencyWhatsAppLink();

  const handleSearch = (customQuery?: string) => {
    const q = customQuery || query;
    if (!q.trim()) return;

    setErrorMessage("");
    startTransition(async () => {
      const res = await lookupPetCardAction(q);
      if (res.success && res.pets && res.pets.length > 0) {
        setResults(res.pets);
        setSelectedPetIndex(0);
      } else {
        setResults([]);
        setErrorMessage(res.error || "No se encontraron mascotas registradas.");
      }
    });
  };

  const currentPet = results && results.length > 0 ? results[selectedPetIndex] : null;

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Header */}
      <header className="px-6 py-4 bg-white/80 backdrop-blur-md border-b border-[#e5e5ea] sticky top-0 z-30 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-sm text-slate-900 leading-tight block">
              Huellitas Felices
            </span>
            <span className="text-[10px] text-slate-500 font-medium">Cartilla Digital Oficial</span>
          </div>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/"
            className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors hidden sm:inline"
          >
            Inicio
          </Link>
          <Button variant="primary" size="sm" onClick={() => setIsBookingOpen(true)}>
            <Calendar className="w-3.5 h-3.5" />
            Pedir Turno
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 max-w-3xl w-full mx-auto p-4 sm:p-6 md:p-8 space-y-6">
        {/* Search Hero Box */}
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-[#e5e5ea] shadow-xs text-center">
          <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
            <QrCode className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Cartilla Sanitaria de tu Mascota
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
            Accede a las vacunas, recetas médicas e historial clínico de tu mascota desde tu celular en cualquier momento.
          </p>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="mt-6 flex flex-col sm:flex-row gap-2.5 max-w-md mx-auto"
          >
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Ingresa tu teléfono o microchip..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                className="w-full h-11 pl-10 pr-4 rounded-2xl bg-[#f5f5f7] text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all"
              />
            </div>
            <Button type="submit" variant="primary" size="md" disabled={isPending}>
              {isPending ? "Buscando..." : "Consultar Cartilla"}
            </Button>
          </form>

          {/* Quick Demo Helpers */}
          <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-center gap-2 text-xs text-slate-400">
            <span>Ejemplos rápidos:</span>
            <button
              type="button"
              onClick={() => {
                setQuery("+54 9 11 5544-3322");
                handleSearch("+54 9 11 5544-3322");
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-[11px] font-medium cursor-pointer"
            >
              📞 Teléfono de Laura (+54 9 11 5544-3322)
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery("981098104523190");
                handleSearch("981098104523190");
              }}
              className="px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-blue-50 hover:text-blue-600 transition-colors text-[11px] font-medium cursor-pointer"
            >
              🔍 Microchip ISO (981098104523190)
            </button>
          </div>
        </div>

        {/* Error message */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm text-center">
            {errorMessage}
          </div>
        )}

        {/* Multi-pet Selector if client has more than 1 pet */}
        {results && results.length > 1 && (
          <div className="flex items-center gap-2 bg-white p-2 rounded-2xl border border-[#e5e5ea] overflow-x-auto">
            <span className="text-xs text-slate-400 font-semibold px-2 uppercase tracking-wider shrink-0">
              Tus Mascotas:
            </span>
            {results.map((pet, idx) => (
              <button
                key={pet.id}
                type="button"
                onClick={() => setSelectedPetIndex(idx)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold shrink-0 transition-all ${
                  selectedPetIndex === idx
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-[#f5f5f7] text-slate-700 hover:bg-slate-200"
                }`}
              >
                🐾 {pet.name} ({pet.species})
              </button>
            ))}
          </div>
        )}

        {/* DIGITAL PET PASSPORT CARD */}
        {currentPet && (
          <div className="space-y-6">
            {/* Identity Card */}
            <div className="bg-white rounded-3xl border border-[#e5e5ea] shadow-md overflow-hidden relative">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-6 text-white relative">
                <div className="flex flex-col sm:flex-row items-center gap-4 text-center sm:text-left">
                  <div className="w-24 h-24 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/40 overflow-hidden shrink-0 shadow-lg">
                    {currentPet.photoUrl ? (
                      <img
                        src={currentPet.photoUrl}
                        alt={currentPet.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-2xl font-bold">
                        {currentPet.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-center sm:justify-start gap-2">
                      <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                        {currentPet.name}
                      </h2>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md border border-white/30 font-medium">
                        {currentPet.sex}
                      </span>
                    </div>

                    <p className="text-blue-100 text-sm mt-0.5">
                      {currentPet.species} • {currentPet.breed}
                    </p>

                    <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mt-2.5 text-xs">
                      {currentPet.weightKg && (
                        <span className="px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-md">
                          Peso: {currentPet.weightKg} kg
                        </span>
                      )}
                      {currentPet.birthDate && (
                        <span className="px-2.5 py-0.5 rounded-full bg-black/20 backdrop-blur-md">
                          Nacimiento: {formatDate(currentPet.birthDate)}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              <div className="p-6 space-y-4">
                {/* Microchip Banner */}
                {currentPet.microchip ? (
                  <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-4 h-4 text-blue-600" />
                      <span className="font-semibold text-slate-900">Microchip ISO Identificador:</span>
                    </div>
                    <span className="font-mono font-bold text-blue-700">{currentPet.microchip}</span>
                  </div>
                ) : (
                  <div className="p-3 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-xs text-slate-500 text-center">
                    Mascota sin microchip registrado. Puedes solicitar su implantación en tu próxima visita.
                  </div>
                )}

                {/* Allergies Alert */}
                {currentPet.allergies && (
                  <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                    <div>
                      <strong className="block font-bold">⚠️ Alergias e Intolerancias Clínicas:</strong>
                      <span className="mt-0.5 block">{currentPet.allergies}</span>
                    </div>
                  </div>
                )}

                {/* Owner Info */}
                <div className="bg-[#f5f5f7] p-4 rounded-2xl text-xs space-y-1">
                  <div className="font-bold text-slate-700 uppercase tracking-wider text-[10px]">
                    Propietario Responsable
                  </div>
                  <div className="text-sm font-semibold text-slate-900">{currentPet.owner?.fullName}</div>
                  <div className="text-slate-500">
                    Tel: {currentPet.owner?.phone} | Email: {currentPet.owner?.email}
                  </div>
                </div>
              </div>
            </div>

            {/* Vaccines & Deworming Section */}
            <div className="bg-white rounded-3xl p-6 border border-[#e5e5ea] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <h3 className="font-bold text-base text-slate-900">Calendario de Vacunación</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {currentPet.vaccines?.length || 0} registradas
                </span>
              </div>

              {!currentPet.vaccines || currentPet.vaccines.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No hay vacunas registradas para este paciente.
                </p>
              ) : (
                <div className="space-y-2.5">
                  {currentPet.vaccines.map((v: any) => {
                    const isApplied = v.status === "applied";
                    const isExpired = v.status === "expired";
                    return (
                      <div
                        key={v.id}
                        className="p-3.5 rounded-2xl border border-slate-100 bg-[#fafafc] flex items-center justify-between gap-3 text-xs"
                      >
                        <div>
                          <div className="font-bold text-slate-900 text-sm">{v.name}</div>
                          <div className="text-slate-500 text-[11px] mt-0.5">
                            Dosis: {v.dose} {v.batchNumber && `• Lote: ${v.batchNumber}`}
                          </div>
                          <div className="text-slate-400 text-[11px] mt-0.5">
                            Próximo vencimiento:{" "}
                            <strong className="text-slate-700">{formatDate(v.nextDueDate)}</strong>
                          </div>
                        </div>

                        <div>
                          {isApplied ? (
                            <Badge variant="green" size="sm">
                              ✓ Al Día
                            </Badge>
                          ) : isExpired ? (
                            <Badge variant="red" size="sm">
                              ⚠️ Vencida
                            </Badge>
                          ) : (
                            <Badge variant="amber" size="sm">
                              🕒 Próxima
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Past Medical Records & Prescriptions */}
            <div className="bg-white rounded-3xl p-6 border border-[#e5e5ea] shadow-xs space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-blue-600" />
                  <h3 className="font-bold text-base text-slate-900">Historial de Consultas & Recetas</h3>
                </div>
                <span className="text-xs text-slate-400">
                  {currentPet.medicalRecords?.length || 0} atenciones
                </span>
              </div>

              {!currentPet.medicalRecords || currentPet.medicalRecords.length === 0 ? (
                <p className="text-xs text-slate-400 text-center py-6">
                  No hay consultas previas registradas.
                </p>
              ) : (
                <div className="space-y-3">
                  {currentPet.medicalRecords.map((r: any) => (
                    <div
                      key={r.id}
                      className="p-4 rounded-2xl border border-slate-100 bg-[#fafafc] space-y-2 text-xs"
                    >
                      <div className="flex items-center justify-between pb-2 border-b border-slate-200/60">
                        <span className="font-bold text-slate-900">{r.reason}</span>
                        <span className="text-slate-400 text-[11px]">{formatDate(r.createdAt)}</span>
                      </div>
                      <div>
                        <span className="font-semibold text-slate-600">Diagnóstico:</span>{" "}
                        <span className="text-slate-800">{r.diagnosis}</span>
                      </div>
                      {r.prescription && (
                        <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200 text-amber-900 font-medium">
                          <strong className="block text-[10px] uppercase tracking-wider text-amber-700 mb-0.5">
                            💊 Indicaciones & Medicamentos:
                          </strong>
                          {r.prescription}
                        </div>
                      )}
                      <div className="text-[11px] text-slate-400 pt-1">
                        Atendido por: {r.vet?.name || "Equipo Veterinario"}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Direct Contact Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <Button
                variant="primary"
                size="lg"
                onClick={() => setIsBookingOpen(true)}
                className="w-full"
              >
                <Calendar className="w-4 h-4" />
                Pedir Turno para {currentPet.name}
              </Button>

              <a
                href={emergencyLink}
                target="_blank"
                rel="noreferrer"
                className="w-full flex items-center justify-center gap-2 py-3 px-6 rounded-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm shadow-md transition-all"
              >
                <MessageCircle className="w-4 h-4" />
                Guardia 24/7 por WhatsApp
              </a>
            </div>
          </div>
        )}
      </main>

      {/* Booking Modal */}
      <PublicBookingModal isOpen={isBookingOpen} onClose={() => setIsBookingOpen(false)} />

      {/* Footer */}
      <footer className="py-6 text-center text-xs text-slate-400 border-t border-[#e5e5ea] bg-white">
        Huellitas Felices — Cartilla Sanitaria Digital © 2026
      </footer>
    </div>
  );
}
