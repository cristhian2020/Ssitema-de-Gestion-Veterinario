"use client";

import React, { useState, useTransition, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import {
  PawPrint,
  Lock,
  Mail,
  ArrowRight,
  ShieldCheck,
  Stethoscope,
  CalendarCheck,
  AlertCircle,
  Eye,
  EyeOff,
  Sparkles,
  HeartHandshake
} from "lucide-react";
import { loginAction } from "@/lib/actions/auth";
import { cn } from "@/lib/utils";

interface DemoAccount {
  name: string;
  roleTitle: string;
  email: string;
  role: "admin" | "vet" | "receptionist";
  badge: string;
  icon: typeof ShieldCheck;
  color: string;
  description: string;
}

const DEMO_ACCOUNTS: DemoAccount[] = [
  {
    name: "Dr. Fernando Ruiz",
    roleTitle: "Director Médico & Administrador",
    email: "admin@huellitasfelices.com",
    role: "admin",
    badge: "Control Total / CRUD",
    icon: ShieldCheck,
    color: "from-purple-500/10 to-indigo-500/10 text-indigo-700 border-indigo-200",
    description: "Acceso ilimitado: inventario, configuración de precios, gestión total y reportes.",
  },
  {
    name: "Dra. Valentina Morales",
    roleTitle: "Médico Veterinario Especialista",
    email: "valentina.morales@huellitasfelices.com",
    role: "vet",
    badge: "Área Clínica & Historiales",
    icon: Stethoscope,
    color: "from-blue-500/10 to-cyan-500/10 text-blue-700 border-blue-200",
    description: "Consultas, historias clínicas completas, recetas médicas y seguimiento.",
  },
  {
    name: "Camila Torres",
    roleTitle: "Coordinación & Recepción",
    email: "camila.recepcion@huellitasfelices.com",
    role: "receptionist",
    badge: "Agenda & Pacientes",
    icon: CalendarCheck,
    color: "from-amber-500/10 to-emerald-500/10 text-emerald-700 border-emerald-200",
    description: "Recepción de pacientes, agenda de citas, recordatorios y WhatsApp directo.",
  },
];

function LoginFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fromUrl = searchParams.get("from") || "/dashboard";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [isPending, startTransition] = useTransition();

  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

  const handleLogin = (e?: React.FormEvent, customEmail?: string, customPassword?: string) => {
    if (e) e.preventDefault();
    setErrorMessage("");

    const loginEmail = customEmail || email;
    const loginPass = customPassword || password;

    if (!loginEmail) {
      setErrorMessage("Por favor ingresa un correo electrónico válido");
      return;
    }

    startTransition(async () => {
      const res = await loginAction({
        email: loginEmail,
        password: loginPass,
      });

      if (!res.success) {
        setErrorMessage(res.error || "No se pudo iniciar sesión");
      } else {
        window.location.href = fromUrl;
      }
    });
  };

  const handleQuickLogin = (demo: DemoAccount) => {
    setEmail(demo.email);
    setPassword("Huellitas2026!");
    handleLogin(undefined, demo.email, "Huellitas2026!");
  };

  return (
    <div className="min-h-screen bg-[#f5f5f7] flex flex-col justify-between selection:bg-blue-600 selection:text-white">
      {/* Header Bar */}
      <header className="px-6 py-4 border-b border-black/5 bg-white/70 backdrop-blur-md flex items-center justify-between sticky top-0 z-30">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white shadow-md shadow-blue-600/20 group-hover:scale-105 transition-transform duration-200">
            <PawPrint className="w-5 h-5" />
          </div>
          <div>
            <span className="font-semibold text-lg text-slate-900 tracking-tight block leading-tight">
              Huellitas Felices
            </span>
            <span className="text-xs text-slate-500 font-medium">Portal Clínico Veterinario</span>
          </div>
        </Link>

        <Link
          href="/"
          className="text-xs font-semibold text-slate-600 hover:text-blue-600 transition-colors px-3 py-1.5 rounded-full hover:bg-black/5"
        >
          ← Volver al sitio público
        </Link>
      </header>

      {/* Main Container */}
      <main className="flex-1 flex items-center justify-center p-4 sm:p-6 md:p-10">
        <div className={cn("w-full items-center", isDev ? "max-w-5xl grid md:grid-cols-12 gap-8" : "max-w-md mx-auto")}>
          {/* Left Column: Login Form */}
          <div className={cn("bg-white rounded-3xl p-8 sm:p-10 shadow-xl shadow-black/[0.03] border border-black/5", isDev && "md:col-span-6")}>
            <div className="mb-6">
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-3 py-1 rounded-full border border-blue-100">
                <Lock className="w-3 h-3" /> Acceso Restringido
              </span>
              <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight mt-3">
                Iniciar Sesión
              </h1>
              <p className="text-sm text-slate-500 mt-1">
                Ingresa con tu usuario asignado para gestionar la clínica veterinaria.
              </p>
            </div>

            {errorMessage && (
              <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 border border-rose-200 text-rose-700 text-xs sm:text-sm flex items-start gap-2.5 animate-in fade-in">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
                <span>{errorMessage}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="doctor@huellitasfelices.com"
                    className="w-full pl-10 pr-4 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider">
                    Contraseña
                  </label>
                  {isDev && <span className="text-[11px] text-slate-400">Demo: Huellitas2026!</span>}
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full pl-10 pr-11 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white transition-all text-slate-900"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full mt-2 py-3.5 px-6 rounded-full bg-blue-600 hover:bg-blue-700 text-white font-semibold text-sm shadow-md shadow-blue-600/20 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isPending ? (
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    Ingresar al Panel <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-5 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" /> Sesión protegida con JWT & Bcrypt
              </span>
              <span>v1.0 (2026)</span>
            </div>
          </div>

          {/* Right Column: Demo Accounts 1-Click Access (Only visible in Development mode) */}
          {isDev && (
            <div className="md:col-span-6 space-y-4">
              <div className="p-1">
                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-600 mb-1">
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>Acceso Rápido por Rol (Demostración)</span>
                </div>
                <p className="text-xs text-slate-500">
                  Selecciona cualquiera de los perfiles configurados para ingresar automáticamente con sus permisos específicos:
                </p>
              </div>

              <div className="space-y-3">
                {DEMO_ACCOUNTS.map((demo) => {
                  const Icon = demo.icon;
                  return (
                    <button
                      key={demo.email}
                      onClick={() => handleQuickLogin(demo)}
                      disabled={isPending}
                      type="button"
                      className="w-full text-left p-4 rounded-3xl bg-white border border-black/5 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/5 transition-all duration-200 group relative overflow-hidden"
                    >
                      <div className="flex items-start gap-3.5">
                        <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${demo.color}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2 mb-0.5">
                            <span className="font-semibold text-slate-900 text-sm group-hover:text-blue-600 transition-colors">
                              {demo.name}
                            </span>
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                              {demo.badge}
                            </span>
                          </div>
                          <p className="text-xs font-medium text-slate-600">{demo.roleTitle}</p>
                          <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">
                            {demo.description}
                          </p>
                          <div className="mt-2 flex items-center justify-between text-[11px]">
                            <span className="text-slate-400 font-mono text-[10px]">{demo.email}</span>
                            <span className="font-semibold text-blue-600 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                              Acceder ahora <ArrowRight className="w-3 h-3" />
                            </span>
                          </div>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              {/* Quick Helper Note */}
              <div className="p-4 rounded-3xl bg-blue-50/70 border border-blue-100 text-xs text-blue-800 flex items-start gap-3">
                <HeartHandshake className="w-5 h-5 shrink-0 text-blue-600 mt-0.5" />
                <div>
                  <p className="font-semibold">Control de Acceso basado en Roles (RBAC)</p>
                  <p className="text-[11px] text-blue-700/80 mt-0.5 leading-relaxed">
                    Cada rol ve adaptada su interfaz. El Administrador cuenta con edición de catálogo y precios, mientras que los veterinarios tienen acceso clínico completo a historias y recetas.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="py-4 text-center text-xs text-slate-400 border-t border-black/5">
        Huellitas Felices — Sistema de Gestión y Atención Veterinaria © 2026
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-[#f5f5f7] flex items-center justify-center">
          <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
        </div>
      }
    >
      <LoginFormContent />
    </Suspense>
  );
}

