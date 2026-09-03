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
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

interface NavItem {
  label: string;
  href: string;
  icon: React.ElementType;
}

const navItems: NavItem[] = [
  { label: "Resumen General", href: "/dashboard", icon: LayoutDashboard },
  { label: "Citas y Agenda", href: "/dashboard/citas", icon: CalendarDays },
  { label: "Pacientes y Dueños", href: "/dashboard/mascotas", icon: PawPrint },
  { label: "Historial Clínico", href: "/dashboard/historial", icon: FileText },
  { label: "Inventario & Servicios", href: "/dashboard/inventario", icon: Package },
];

export function Sidebar() {
  const pathname = usePathname();
  const [activeRole, setActiveRole] = React.useState<"admin" | "vet" | "receptionist">("vet");

  const roles = [
    { id: "vet", label: "Veterinario", icon: Stethoscope },
    { id: "receptionist", label: "Recepción", icon: Headphones },
    { id: "admin", label: "Director / Admin", icon: ShieldCheck },
  ] as const;

  return (
    <aside className="w-64 bg-[#ffffff] border-r border-[#e5e5ea] flex flex-col shrink-0 h-screen sticky top-0">
      {/* Brand Header */}
      <div className="p-6 border-b border-[#f0f0f0]">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-10 h-10 rounded-2xl bg-[#0066cc] flex items-center justify-center text-white shadow-sm group-hover:bg-[#0071e3] transition-colors">
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

        {/* Role Selector Simulator */}
        <div className="mt-4 pt-3 border-t border-[#f5f5f7]">
          <div className="flex items-center justify-between mb-1.5">
            <span className="text-[10px] font-semibold tracking-wider text-[#8e8e93] uppercase">
              Modo de Rol:
            </span>
            <Badge variant="blue" size="sm">
              {activeRole.toUpperCase()}
            </Badge>
          </div>
          <div className="grid grid-cols-3 gap-1 bg-[#f5f5f7] p-1 rounded-xl">
            {roles.map((r) => (
              <button
                key={r.id}
                type="button"
                onClick={() => setActiveRole(r.id)}
                title={r.label}
                className={cn(
                  "flex items-center justify-center py-1 rounded-lg text-xs font-medium transition-all",
                  activeRole === r.id
                    ? "bg-white text-[#0066cc] shadow-xs"
                    : "text-[#7a7a7a] hover:text-[#1d1d1f]"
                )}
              >
                <r.icon className="w-3.5 h-3.5" />
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Navigation items */}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        <div className="px-3 py-1 text-[11px] font-semibold text-[#8e8e93] uppercase tracking-wider">
          Módulos Clínicos
        </div>
        {navItems.map((item) => {
          const isActive =
            item.href === "/dashboard"
              ? pathname === "/dashboard"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all duration-150",
                isActive
                  ? "bg-[#0066cc]/10 text-[#0066cc] font-semibold"
                  : "text-[#333333] hover:bg-[#f5f5f7] hover:text-[#1d1d1f]"
              )}
            >
              <item.icon
                className={cn(
                  "w-4 h-4 transition-colors",
                  isActive ? "text-[#0066cc]" : "text-[#7a7a7a]"
                )}
              />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer link to public landing */}
      <div className="p-4 border-t border-[#f0f0f0] bg-[#fafafc]">
        <Link
          href="/"
          className="flex items-center justify-between px-3 py-2 text-xs font-medium text-[#7a7a7a] hover:text-[#0066cc] rounded-xl hover:bg-white transition-all border border-transparent hover:border-[#e5e5ea]"
        >
          <span className="flex items-center gap-2">
            <Sparkles className="w-3.5 h-3.5 text-[#0066cc]" />
            Ver Portal de Clientes
          </span>
          <ExternalLink className="w-3.5 h-3.5" />
        </Link>
      </div>
    </aside>
  );
}
