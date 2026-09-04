"use client";

import * as React from "react";
import Link from "next/link";
import {
  PawPrint,
  Calendar,
  PhoneCall,
  Clock,
  ShieldCheck,
  Stethoscope,
  HeartPulse,
  Sparkles,
  ArrowRight,
  CheckCircle,
  MessageCircle,
  Scissors,
  Eye,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PublicBookingModal } from "@/components/landing/PublicBookingModal";
import { generateEmergencyWhatsAppLink } from "@/lib/utils";

export default function LandingPage() {
  const [isBookingOpen, setIsBookingOpen] = React.useState(false);
  const emergencyUrl = generateEmergencyWhatsAppLink();

  const services = [
    {
      title: "Medicina Preventiva & Chequeos",
      category: "Consulta",
      desc: "Exámenes físicos integrales, control de peso, auscultación cardiopulmonar y planes de desparasitación personalizados para cada etapa de su vida.",
      image: "https://images.unsplash.com/photo-1576201836106-db1758fd1c97?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Cirugía & Quirófano de Alta Complejidad",
      category: "Quirófano",
      desc: "Monitoreo multiparamétrico anestésico en tiempo real, esterilizaciones laparoscópicas y traumatología con recuperación asistida.",
      image: "https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Plan de Vacunación & Certificados",
      category: "Inmunología",
      desc: "Esquemas de vacunación oficiales contra rabia, séxtuple y triple felina con chip identificador y cartilla digital.",
      image: "https://images.unsplash.com/photo-1548767797-d8c844163c4c?w=600&auto=format&fit=crop&q=80",
    },
    {
      title: "Estética Canina & Baño Terapéutico",
      category: "Spa & Higiene",
      desc: "Cortes de raza higiénicos, limpieza de oídos, corte de uñas y dermocosmética especializada para pieles sensibles.",
      image: "https://images.unsplash.com/photo-1516734212186-a967f81ad0d7?w=600&auto=format&fit=crop&q=80",
    },
  ];

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col selection:bg-[#0066cc]/20">
      {/* 1. Global Navigation Bar (Apple Style Frosted Glass) */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-[#e5e5ea] transition-all">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#0066cc] flex items-center justify-center text-white shadow-sm">
              <PawPrint className="w-5 h-5 fill-white/20" />
            </div>
            <div>
              <span className="font-semibold text-base text-[#1d1d1f] tracking-tight block">
                Huellitas Felices
              </span>
              <span className="text-[10px] text-[#7a7a7a] tracking-wider uppercase font-semibold block">
                Clínica Veterinaria 24/7
              </span>
            </div>
          </div>

          <nav className="hidden md:flex items-center gap-8 text-xs font-medium text-[#333333]">
            <a href="#servicios" className="hover:text-[#0066cc] transition-colors">
              Servicios Clínicos
            </a>
            <a href="#cartilla" className="hover:text-[#0066cc] transition-colors">
              Cartilla Digital
            </a>
            <a href="#urgencias" className="hover:text-[#0066cc] transition-colors">
              Guardia 24/7
            </a>
          </nav>

          <div className="flex items-center gap-3">
            <Link href="/cartilla" className="hidden sm:inline-flex">
              <Button variant="outline" size="sm" className="border-[#0066cc]/30 text-[#0066cc] hover:bg-[#0066cc]/5">
                <Sparkles className="w-3.5 h-3.5 text-[#ff9500]" />
                Mi Cartilla
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="secondary" size="sm">
                Acceso Personal
              </Button>
            </Link>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsBookingOpen(true)}
            >
              <Calendar className="w-3.5 h-3.5" />
              Pedir Turno
            </Button>
          </div>
        </div>
      </header>

      {/* 2. Hero Section (Apple Aesthetic: Large typography, clean negative letter spacing, high impact) */}
      <section className="pt-20 pb-16 px-6 text-center max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#e5e5ea] shadow-xs mb-6">
          <span className="w-2 h-2 rounded-full bg-[#34c759] animate-pulse" />
          <span className="text-xs font-medium text-[#1d1d1f]">
            Atención veterinaria integral con guardia médica permanente
          </span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-semibold tracking-[-0.03em] text-[#1d1d1f] leading-[1.08] mb-6">
          Cuidado médico extraordinario para quienes más amas.
        </h1>

        <p className="text-lg sm:text-xl text-[#7a7a7a] max-w-2xl mx-auto font-normal leading-relaxed mb-10">
          Diagnósticos precisos, seguimiento en historia clínica digital y la calidez humana que tu
          mascota merece.
        </p>

        {/* Dual Call To Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Button
            variant="primary"
            size="lg"
            onClick={() => setIsBookingOpen(true)}
            className="w-full sm:w-auto shadow-md"
          >
            <Calendar className="w-4 h-4" />
            Reservar Cita Online
          </Button>

          <a
            href={emergencyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="w-full sm:w-auto"
          >
            <Button variant="secondary" size="lg" className="w-full sm:w-auto">
              <PhoneCall className="w-4 h-4 text-[#ff3b30]" />
              Emergencias 24/7 por WhatsApp
            </Button>
          </a>
        </div>

        {/* Value Props Pills */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-16 text-left">
          <div className="bg-white p-4 rounded-2xl border border-[#e5e5ea] shadow-xs">
            <ShieldCheck className="w-5 h-5 text-[#0066cc] mb-2" />
            <h4 className="text-xs font-semibold text-[#1d1d1f]">Quirófano Seguro</h4>
            <p className="text-[11px] text-[#7a7a7a] mt-0.5">Monitoreo multiparamétrico continuo</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#e5e5ea] shadow-xs">
            <HeartPulse className="w-5 h-5 text-[#34c759] mb-2" />
            <h4 className="text-xs font-semibold text-[#1d1d1f]">Historia Digital</h4>
            <p className="text-[11px] text-[#7a7a7a] mt-0.5">Consultas y vacunas en la nube</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#e5e5ea] shadow-xs">
            <Clock className="w-5 h-5 text-[#ff9500] mb-2" />
            <h4 className="text-xs font-semibold text-[#1d1d1f]">Puntualidad</h4>
            <p className="text-[11px] text-[#7a7a7a] mt-0.5">Gestión de turnos sin demoras</p>
          </div>
          <div className="bg-white p-4 rounded-2xl border border-[#e5e5ea] shadow-xs">
            <MessageCircle className="w-5 h-5 text-[#25D366] mb-2" />
            <h4 className="text-xs font-semibold text-[#1d1d1f]">Avisos WhatsApp</h4>
            <p className="text-[11px] text-[#7a7a7a] mt-0.5">Recordatorios automáticos</p>
          </div>
        </div>
      </section>

      {/* 3. Services Gallery (Photography-first Museum Grid according to Desing.md) */}
      <section id="servicios" className="py-16 px-6 max-w-6xl mx-auto w-full">
        <div className="text-center mb-12">
          <span className="text-xs font-semibold text-[#0066cc] uppercase tracking-wider">
            Nuestras Especialidades
          </span>
          <h2 className="text-3xl sm:text-4xl font-semibold text-[#1d1d1f] tracking-tight mt-2">
            Todo lo que tu mascota necesita en un solo lugar.
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((svc, i) => (
            <div
              key={i}
              className="bg-white rounded-3xl overflow-hidden border border-[#e5e5ea] shadow-xs hover:shadow-lg transition-all group flex flex-col"
            >
              <div className="h-64 overflow-hidden relative">
                <img
                  src={svc.image}
                  alt={svc.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-4 left-4">
                  <Badge variant="blue" size="md">
                    {svc.category}
                  </Badge>
                </div>
              </div>
              <div className="p-8 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-[#1d1d1f] tracking-tight mb-2">
                    {svc.title}
                  </h3>
                  <p className="text-sm text-[#7a7a7a] leading-relaxed">{svc.desc}</p>
                </div>
                <div className="mt-6 pt-6 border-t border-[#f0f0f0] flex items-center justify-between">
                  <button
                    type="button"
                    onClick={() => setIsBookingOpen(true)}
                    className="text-xs font-semibold text-[#0066cc] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    Agendar este servicio
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. Cartilla Digital Section */}
      <section id="cartilla" className="py-12 px-6 max-w-6xl mx-auto w-full">
        <div className="bg-linear-to-br from-[#0066cc]/5 via-white to-[#0066cc]/10 border border-[#0066cc]/20 rounded-3xl p-8 sm:p-12 flex flex-col md:flex-row items-center justify-between gap-8 shadow-xs">
          <div className="max-w-xl space-y-3">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#0066cc]/10 text-[#0066cc] text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-[#ff9500]" />
              Nuevo: Portal Móvil de Propietarios
            </div>
            <h2 className="text-2xl sm:text-3xl font-semibold tracking-tight text-[#1d1d1f]">
              Consulta la Cartilla Sanitaria Digital de tu mascota al instante.
            </h2>
            <p className="text-sm text-[#7a7a7a] leading-relaxed">
              Ingresa con tu número de teléfono registrado o con el número de microchip ISO de tu mascota para ver el carnet de vacunas al día, fechas de refuerzo, consultas previas e indicaciones veterinarias.
            </p>
          </div>
          <div className="shrink-0 flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
            <Link href="/cartilla" className="w-full sm:w-auto">
              <Button variant="primary" size="lg" className="w-full sm:w-auto bg-[#0066cc] hover:bg-[#0055b3] shadow-md">
                <Sparkles className="w-4 h-4 text-amber-300" />
                Abrir Mi Cartilla Digital
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 5. Emergency 24/7 Section */}
      <section
        id="urgencias"
        className="py-16 px-6 max-w-6xl mx-auto w-full mb-16"
      >
        <div className="bg-[#1d1d1f] text-white rounded-3xl p-8 sm:p-14 flex flex-col md:flex-row items-center justify-between gap-8 relative overflow-hidden">
          <div className="max-w-xl space-y-4 z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#ff3b30]/20 text-[#ff453a] text-xs font-semibold">
              <span className="w-2 h-2 rounded-full bg-[#ff3b30] animate-ping" />
              Guardia Veterinaria 24/7
            </div>
            <h2 className="text-3xl sm:text-4xl font-semibold tracking-tight text-white">
              ¿Tu mascota tiene una urgencia médica ahora mismo?
            </h2>
            <p className="text-sm text-[#cccccc] leading-relaxed">
              Nuestro equipo de veterinarios de guardia y quirófano de urgencia se encuentra listo
              las 24 horas del día para estabilizar y atender a tu compañero sin demoras.
            </p>
          </div>

          <div className="z-10 shrink-0 w-full sm:w-auto">
            <a
              href={emergencyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block w-full sm:w-auto"
            >
              <button
                type="button"
                className="w-full sm:w-auto px-8 py-4 rounded-full bg-[#25D366] text-white font-semibold text-base flex items-center justify-center gap-3 hover:bg-[#20bd5a] transition-all shadow-lg active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-5 h-5 fill-white" />
                Contactar Guardia por WhatsApp
              </button>
            </a>
          </div>
        </div>
      </section>

      {/* 5. Minimalist Footer */}
      <footer className="mt-auto bg-white border-t border-[#e5e5ea] py-12 px-6">
        <div className="max-w-6xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-xs text-[#7a7a7a]">
          <div className="flex items-center gap-2">
            <PawPrint className="w-4 h-4 text-[#0066cc]" />
            <span className="font-semibold text-[#1d1d1f]">Veterinaria Huellitas Felices</span>
            <span>— Av. Santa Fe 3421, Palermo, Buenos Aires</span>
          </div>
          <div className="flex items-center gap-6">
            <Link href="/dashboard" className="hover:text-[#0066cc]">
              Panel Clínico
            </Link>
            <a href={emergencyUrl} target="_blank" rel="noopener noreferrer" className="hover:text-[#0066cc]">
              WhatsApp Guardia
            </a>
            <span>© {new Date().getFullYear()} Huellitas Felices. Todos los derechos reservados.</span>
          </div>
        </div>
      </footer>

      {/* 6. Floating 24/7 WhatsApp Button */}
      <a
        href={emergencyUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2.5 bg-[#25D366] text-white px-5 py-3.5 rounded-full shadow-2xl hover:bg-[#20bd5a] transition-all duration-200 animate-pulse-glow"
        title="Urgencias Veterinarias 24/7 por WhatsApp"
      >
        <MessageCircle className="w-5 h-5 fill-white" />
        <span className="font-semibold text-xs sm:text-sm tracking-tight">
          Emergencias 24/7
        </span>
      </a>

      {/* Public Booking Modal */}
      <PublicBookingModal
        isOpen={isBookingOpen}
        onClose={() => setIsBookingOpen(false)}
      />
    </div>
  );
}
