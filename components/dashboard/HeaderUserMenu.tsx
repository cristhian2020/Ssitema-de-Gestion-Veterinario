"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/components/providers/AuthProvider";
import { SessionUser } from "@/lib/auth/session";
import {
  ShieldCheck,
  Stethoscope,
  Headphones,
  LogOut,
  ChevronDown,
  Sparkles,
  Check,
  UserCheck
} from "lucide-react";
import { cn } from "@/lib/utils";

interface HeaderUserMenuProps {
  user: SessionUser | null;
}

export function HeaderUserMenu({ user: initialUser }: HeaderUserMenuProps) {
  const { user, logout, switchUserFast } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const currentUser = user || initialUser;

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const roleConfig = {
    admin: {
      label: "Administrador",
      fullTitle: "Director Médico & Admin",
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: ShieldCheck,
      desc: "Acceso total al CRUD, inventario, precios y reportes",
    },
    vet: {
      label: "Veterinario",
      fullTitle: "Médico Veterinario",
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Stethoscope,
      desc: "Historias clínicas, diagnósticos, recetas y pacientes",
    },
    receptionist: {
      label: "Recepción",
      fullTitle: "Coordinación & Recepción",
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Headphones,
      desc: "Agenda de citas, registro de dueños y WhatsApp",
    },
    client: {
      label: "Cliente",
      fullTitle: "Dueño de Mascota",
      badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
      icon: UserCheck,
      desc: "Portal de cliente",
    },
  };

  const currentRole = currentUser?.role || "vet";
  const config = roleConfig[currentRole] || roleConfig.vet;
  const RoleIcon = config.icon;

  const demoAccounts = [
    {
      name: "Dr. Fernando Ruiz",
      email: "admin@huellitasfelices.com",
      role: "admin" as const,
      title: "Director / Admin (CRUD Total)",
    },
    {
      name: "Dra. Valentina Morales",
      email: "valentina.morales@huellitasfelices.com",
      role: "vet" as const,
      title: "Veterinaria (Área Clínica)",
    },
    {
      name: "Camila Torres",
      email: "camila.recepcion@huellitasfelices.com",
      role: "receptionist" as const,
      title: "Recepción (Citas & Triaje)",
    },
  ];

  const handleSwitch = async (email: string) => {
    setIsSwitching(true);
    try {
      await switchUserFast(email);
      setIsOpen(false);
    } finally {
      setIsSwitching(false);
    }
  };

  const isDev = process.env.NODE_ENV === "development" || process.env.NEXT_PUBLIC_ENABLE_DEMO_LOGIN === "true";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2.5 p-1.5 pl-2.5 rounded-full hover:bg-black/5 border border-black/5 transition-all text-left"
      >
        {/* Role Pill */}
        <span
          className={cn(
            "hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-0.5 rounded-full border",
            config.badgeColor
          )}
        >
          <RoleIcon className="w-3 h-3" />
          {config.label}
        </span>

        {/* User Name */}
        <div className="text-right hidden sm:block">
          <span className="text-xs font-semibold text-slate-800 block leading-tight">
            {currentUser?.name || "Usuario"}
          </span>
          <span className="text-[10px] text-slate-400 font-medium block">
            {currentUser?.email || "personal@huellitas.com"}
          </span>
        </div>

        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shadow-xs overflow-hidden">
          {currentUser?.avatarUrl ? (
            <img
              src={currentUser.avatarUrl}
              alt={currentUser.name}
              className="w-full h-full object-cover"
            />
          ) : (
            (currentUser?.name || "U").substring(0, 2).toUpperCase()
          )}
        </div>

        <ChevronDown className={cn("w-3.5 h-3.5 text-slate-400 transition-transform duration-200", isOpen && "rotate-180")} />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl shadow-xl shadow-black/10 border border-black/5 p-3 z-50 animate-in fade-in zoom-in-95 duration-150">
          {/* User info card */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-2">
            <div className="flex items-center gap-3 mb-2">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-semibold text-sm flex items-center justify-center shadow-xs overflow-hidden shrink-0">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  (currentUser?.name || "U").substring(0, 2).toUpperCase()
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="text-xs font-bold text-slate-900 truncate">
                  {currentUser?.name}
                </h4>
                <p className="text-[11px] text-slate-500 truncate">{currentUser?.email}</p>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between">
              <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                Rol Activo
              </span>
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[10px] font-semibold px-2 py-0.5 rounded-full border",
                  config.badgeColor
                )}
              >
                <RoleIcon className="w-3 h-3" />
                {config.fullTitle}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 mt-1.5 leading-relaxed">{config.desc}</p>
          </div>

          {/* Quick Demo Switcher (Only visible in Development mode) */}
          {isDev && (
            <div className="px-2 py-1.5">
              <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-1.5">
                <Sparkles className="w-3 h-3 text-amber-500" />
                <span>Cambiar rol para probar permisos:</span>
              </div>

              <div className="space-y-1">
                {demoAccounts.map((account) => {
                  const isSelected = currentUser?.email === account.email;
                  return (
                    <button
                      key={account.email}
                      disabled={isSwitching}
                      onClick={() => handleSwitch(account.email)}
                      className={cn(
                        "w-full text-left px-2.5 py-1.5 rounded-xl text-xs flex items-center justify-between transition-colors",
                        isSelected
                          ? "bg-blue-50 text-blue-700 font-semibold"
                          : "hover:bg-slate-50 text-slate-700"
                      )}
                    >
                      <div>
                        <div className="font-medium text-[11px] leading-tight">{account.name}</div>
                        <div className="text-[10px] text-slate-400">{account.title}</div>
                      </div>
                      {isSelected && <Check className="w-3.5 h-3.5 text-blue-600 shrink-0" />}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Logout button */}
          <div className="mt-2 pt-2 border-t border-slate-100">
            <button
              onClick={() => logout()}
              className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
