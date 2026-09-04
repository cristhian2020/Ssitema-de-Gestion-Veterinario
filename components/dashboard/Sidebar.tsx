"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  PawPrint,
  FileText,
  Package,
  LayoutDashboard,
  ExternalLink,
  ShieldCheck,
  Stethoscope,
  Headphones,
  Sparkles,
  LogOut,
  UserCheck,
  Receipt,
  BarChart3,
  Users,
  QrCode,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/components/providers/AuthProvider";
import { SessionUser } from "@/lib/auth/session";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles?: Array<"admin" | "vet" | "receptionist">;
  badge?: string;
}

const navItems: NavItem[] = [
  { label: "Resumen General", href: "/dashboard", icon: LayoutDashboard },
  { label: "Citas y Agenda", href: "/dashboard/citas", icon: CalendarDays },
  { label: "Pacientes y Dueños", href: "/dashboard/mascotas", icon: PawPrint },
  { label: "Historial Clínico", href: "/dashboard/historial", icon: FileText },
  { label: "Inventario & Servicios", href: "/dashboard/inventario", icon: Package },
  { label: "Caja & Facturación", href: "/dashboard/caja", icon: Receipt },
  { label: "Reportes & Excel", href: "/dashboard/reportes", icon: BarChart3 },
  {
    label: "Equipo Clínico",
    href: "/dashboard/personal",
    icon: Users,
    roles: ["admin"],
    badge: "Admin",
  },
];

export function Sidebar({ user: initialUser }: { user?: SessionUser | null }) {
  const pathname = usePathname();
  const { user, role, logout } = useAuth();

  const currentUser = user || initialUser;
  const currentRole = currentUser?.role || role || "vet";

  const roleMeta = {
    admin: {
      label: "Admin / Director",
      color: "bg-indigo-50 text-indigo-700 border-indigo-200",
      icon: ShieldCheck,
    },
    vet: {
      label: "Veterinario",
      color: "bg-blue-50 text-blue-700 border-blue-200",
      icon: Stethoscope,
    },
    receptionist: {
      label: "Recepción",
      color: "bg-emerald-50 text-emerald-700 border-emerald-200",
      icon: Headphones,
    },
    client: {
      label: "Cliente",
      color: "bg-slate-50 text-slate-700 border-slate-200",
      icon: UserCheck,
    },
  }[currentRole as "admin" | "vet" | "receptionist" | "client"] || {
    label: "Veterinario",
    color: "bg-blue-50 text-blue-700 border-blue-200",
    icon: Stethoscope,
  };

  const RoleIcon = roleMeta.icon;

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-[#e5e5ea] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-5 border-b border-[#f0f0f0]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-2xl bg-[#0066cc] flex items-center justify-center text-white shadow-sm group-hover:scale-105 transition-transform">
            <PawPrint className="w-5 h-5 fill-white/20" />
          </div>
          <div>
            <span className="font-semibold text-base text-[#1d1d1f] tracking-tight block">
              Huellitas Felices
            </span>
            <span className="text-[11px] text-[#7a7a7a] font-medium block">
              Gestión Clínica & Turnos
            </span>
          </div>
        </Link>

        {/* Authenticated User Mini Card */}
        <div className="mt-4 p-2.5 rounded-2xl bg-[#f5f5f7] border border-black/5 flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white font-semibold text-xs flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
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
            <div className="text-xs font-bold text-[#1d1d1f] truncate leading-tight">
              {currentUser?.name || "Personal Clínico"}
            </div>
            <div className="flex items-center gap-1 mt-0.5">
              <span
                className={cn(
                  "inline-flex items-center gap-1 text-[9px] font-semibold px-2 py-0.2 rounded-full border",
                  roleMeta.color
                )}
              >
                <RoleIcon className="w-2.5 h-2.5" />
                {roleMeta.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1.5 text-[10px] font-semibold text-[#8e8e93] uppercase tracking-wider">
          Módulos del Sistema
        </div>
        {navItems.map((item) => {
          if (item.roles && !item.roles.includes(currentRole as any)) {
            return null;
          }

          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          let extraBadge: string | null = item.badge || null;
          if (item.href === "/dashboard/inventario") {
            extraBadge = currentRole === "admin" ? "CRUD" : null;
          }

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#0066cc]/10 text-[#0066cc] font-semibold"
                  : "text-[#333333] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              )}
            >
              <div className="flex items-center gap-3">
                <item.icon
                  className={cn(
                    "w-4 h-4 transition-colors",
                    isActive ? "text-[#0066cc]" : "text-[#7a7a7a]"
                  )}
                />
                <span>{item.label}</span>
              </div>
              {extraBadge && (
                <span className="text-[10px] font-semibold px-1.5 py-0.5 rounded bg-indigo-100 text-indigo-700">
                  {extraBadge}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      {/* Footer link to public landing & logout */}
      <div className="p-3 border-t border-[#f0f0f0] bg-[#fafafc] space-y-1">
        <Link
          href="/cartilla"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#7a7a7a] hover:text-[#0066cc] rounded-xl hover:bg-white transition-all border border-transparent hover:border-[#e5e5ea]"
        >
          <span className="flex items-center gap-2">
            <QrCode className="w-3.5 h-3.5 text-blue-600" />
            Cartilla Digital
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#7a7a7a] hover:text-[#0066cc] rounded-xl hover:bg-white transition-all border border-transparent hover:border-[#e5e5ea]"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0066cc]" />
            Portal Clientes
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>

        <button
          onClick={() => logout()}
          type="button"
          className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 hover:text-rose-700 hover:bg-rose-50 rounded-xl transition-all cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          <span>Cerrar Sesión</span>
        </button>
      </div>
    </aside>
  );
}
