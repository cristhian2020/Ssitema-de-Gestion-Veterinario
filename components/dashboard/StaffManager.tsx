"use client";

import * as React from "react";
import {
  Users,
  UserPlus,
  ShieldCheck,
  Stethoscope,
  Headphones,
  KeyRound,
  Lock,
  Search,
  Phone,
  Mail,
  CheckCircle2,
  XCircle,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { type User } from "@/db/schema";
import {
  createStaffUserAction,
  resetUserPasswordAction,
  toggleUserStatusAction,
} from "@/lib/actions/users";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { useAuth } from "@/components/providers/AuthProvider";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface StaffManagerProps {
  initialUsers: User[];
}

export function StaffManager({ initialUsers }: StaffManagerProps) {
  const router = useRouter();
  const { toast } = useToast();
  const { isAdmin, user: currentLoggedUser } = useAuth();

  const [staffList, setStaffList] = React.useState(initialUsers);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [roleFilter, setRoleFilter] = React.useState("all");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  const [isResetModalOpen, setIsResetModalOpen] = React.useState(false);
  const [selectedUserForReset, setSelectedUserForReset] = React.useState<User | null>(null);
  const [newPassword, setNewPassword] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New Staff Form
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState<"admin" | "vet" | "receptionist">("vet");
  const [specialty, setSpecialty] = React.useState("");
  const [phone, setPhone] = React.useState("");

  const filteredStaff = staffList.filter((u) => {
    const matchesSearch =
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      u.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.specialty && u.specialty.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesRole = roleFilter === "all" || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const handleCreateStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast("Completa los campos obligatorios", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await createStaffUserAction({
        name,
        email,
        password,
        role,
        specialty,
        phone,
      });

      if (res.success && res.user) {
        toast(`¡Colaborador ${name} registrado con éxito!`, "success");
        setStaffList((prev) => [res.user!, ...prev]);
        router.refresh();
        setIsCreateModalOpen(false);

        // Reset
        setName("");
        setEmail("");
        setPassword("");
        setSpecialty("");
        setPhone("");
      } else {
        toast(res.error || "No se pudo registrar el usuario", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserForReset) return;
    if (!newPassword || newPassword.length < 6) {
      toast("La contraseña debe tener mínimo 6 caracteres", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await resetUserPasswordAction(selectedUserForReset.id, newPassword);
      if (res.success) {
        toast(`Contraseña de ${selectedUserForReset.name} actualizada`, "success");
        setIsResetModalOpen(false);
        setSelectedUserForReset(null);
        setNewPassword("");
      } else {
        toast(res.error || "Error al cambiar contraseña", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleStatus = async (targetUser: User) => {
    try {
      const res = await toggleUserStatusAction(targetUser.id, targetUser.active);
      if (res.success) {
        setStaffList((prev) =>
          prev.map((u) => (u.id === targetUser.id ? { ...u, active: res.active! } : u))
        );
        toast(`Estado de ${targetUser.name} actualizado`, "success");
        router.refresh();
      } else {
        toast(res.error || "No se pudo cambiar el estado", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  };

  const roleMeta = {
    admin: {
      label: "Director / Admin",
      icon: ShieldCheck,
      badgeColor: "bg-indigo-50 text-indigo-700 border-indigo-200",
    },
    vet: {
      label: "Médico Veterinario",
      icon: Stethoscope,
      badgeColor: "bg-blue-50 text-blue-700 border-blue-200",
    },
    receptionist: {
      label: "Recepción y Triaje",
      icon: Headphones,
      badgeColor: "bg-emerald-50 text-emerald-700 border-emerald-200",
    },
    client: {
      label: "Cliente",
      icon: Users,
      badgeColor: "bg-slate-50 text-slate-700 border-slate-200",
    },
  };

  if (!isAdmin) {
    return (
      <div className="bg-white rounded-3xl p-12 text-center border border-[#e5e5ea] max-w-lg mx-auto">
        <Lock className="w-12 h-12 text-slate-300 mx-auto mb-3" />
        <h3 className="text-lg font-bold text-slate-900">Acceso Exclusivo de Dirección Médica</h3>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
          Solo los usuarios con rol de Administrador o Director Clínico pueden gestionar las cuentas de personal, dar de alta médicos y restablecer contraseñas.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            Gestión de Personal & Usuarios
          </h2>
          <p className="text-sm text-[#7a7a7a]">
            Directorio de colaboradores clínicos, control de accesos y restablecimiento de credenciales
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsCreateModalOpen(true)}>
          <UserPlus className="w-4 h-4" />
          Nuevo Colaborador
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-[#e5e5ea] shadow-xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-[#8e8e93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, correo o especialidad..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-2xl bg-[#f5f5f7] text-xs text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-[#7a7a7a] font-medium">Filtrar por Rol:</span>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="h-10 px-3 rounded-2xl bg-[#f5f5f7] text-xs font-semibold text-[#1d1d1f] border-none focus:ring-2 focus:ring-[#0066cc]/20 cursor-pointer"
          >
            <option value="all">Todos los Roles ({staffList.length})</option>
            <option value="admin">Directores / Admin</option>
            <option value="vet">Médicos Veterinarios</option>
            <option value="receptionist">Recepción & Coordinación</option>
          </select>
        </div>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredStaff.map((u) => {
          const meta = roleMeta[u.role as keyof typeof roleMeta] || roleMeta.vet;
          const RoleIcon = meta.icon;
          const isCurrentUser = Number(currentLoggedUser?.id) === u.id;

          return (
            <div
              key={u.id}
              className={cn(
                "bg-white rounded-3xl border border-[#e5e5ea] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden",
                !u.active && "opacity-60 bg-slate-50"
              )}
            >
              <div>
                {/* Header with Avatar & Badge */}
                <div className="flex items-start justify-between gap-3 mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600 text-white font-bold text-sm flex items-center justify-center shrink-0 overflow-hidden shadow-xs">
                      {u.avatarUrl ? (
                        <img src={u.avatarUrl} alt={u.name} className="w-full h-full object-cover" />
                      ) : (
                        u.name.substring(0, 2).toUpperCase()
                      )}
                    </div>
                    <div>
                      <h4 className="font-bold text-base text-[#1d1d1f] leading-tight flex items-center gap-1.5">
                        {u.name}
                        {isCurrentUser && (
                          <span className="text-[9px] bg-blue-100 text-blue-700 px-1.5 py-0.2 rounded font-semibold">
                            Tú
                          </span>
                        )}
                      </h4>
                      <span className="text-xs text-slate-500 font-medium">{u.specialty || "Personal Clínico"}</span>
                    </div>
                  </div>

                  <span
                    className={cn(
                      "inline-flex items-center gap-1 text-[10px] font-semibold px-2.5 py-0.5 rounded-full border shrink-0",
                      meta.badgeColor
                    )}
                  >
                    <RoleIcon className="w-3 h-3" />
                    {meta.label}
                  </span>
                </div>

                {/* Contact details */}
                <div className="p-3 bg-[#f5f5f7] rounded-2xl space-y-1.5 text-xs text-slate-600 mb-4">
                  <div className="flex items-center gap-2 truncate">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="truncate">{u.email}</span>
                  </div>
                  {u.phone && (
                    <div className="flex items-center gap-2">
                      <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                      <span>{u.phone}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between pt-1 border-t border-slate-200/60 text-[11px]">
                    <span className="text-slate-400">Estado de cuenta:</span>
                    <span className={cn("font-semibold", u.active ? "text-emerald-600" : "text-rose-600")}>
                      {u.active ? "● Activo" : "○ Inactivo / Suspendido"}
                    </span>
                  </div>
                </div>
              </div>

              {/* Actions Footer */}
              <div className="flex items-center justify-between gap-2 pt-3 border-t border-[#f0f0f0]">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    setSelectedUserForReset(u);
                    setNewPassword("");
                    setIsResetModalOpen(true);
                  }}
                  className="flex-1 text-xs"
                >
                  <KeyRound className="w-3.5 h-3.5 text-blue-600" />
                  Cambiar Clave
                </Button>

                {!isCurrentUser && (
                  <Button
                    variant={u.active ? "secondary" : "primary"}
                    size="sm"
                    onClick={() => handleToggleStatus(u)}
                    className="text-xs"
                  >
                    {u.active ? "Suspender" : "Reactivar"}
                  </Button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Nuevo Colaborador */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Registrar Nuevo Colaborador Clínico"
        description="El nuevo usuario podrá iniciar sesión en la plataforma con las credenciales que definas."
      >
        <form onSubmit={handleCreateStaff} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
              Nombre Completo *
            </label>
            <Input
              type="text"
              placeholder="Ej: Dra. Lucía Gómez"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Correo Electrónico *
              </label>
              <Input
                type="email"
                placeholder="lucia.gomez@huellitasfelices.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Rol en el Sistema *
              </label>
              <Select value={role} onChange={(e) => setRole(e.target.value as any)}>
                <option value="vet">Médico Veterinario</option>
                <option value="receptionist">Recepción y Triaje</option>
                <option value="admin">Director / Administrador</option>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Especialidad o Área
              </label>
              <Input
                type="text"
                placeholder="Ej: Cardiología, Cirugía, Ecografía..."
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Teléfono de Contacto
              </label>
              <Input
                type="text"
                placeholder="+54 9 11 4455-6677"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
              Contraseña de Acceso * (Mínimo 6 caracteres)
            </label>
            <Input
              type="password"
              placeholder="••••••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
          </div>

          <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f0f0f0]">
            <Button
              type="button"
              variant="secondary"
              size="md"
              onClick={() => setIsCreateModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
              {isSubmitting ? "Registrando..." : "Crear Usuario"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Cambiar Contraseña */}
      {selectedUserForReset && (
        <Modal
          isOpen={isResetModalOpen}
          onClose={() => {
            setIsResetModalOpen(false);
            setSelectedUserForReset(null);
          }}
          title={`Cambiar Contraseña de ${selectedUserForReset.name}`}
          description="Establece una nueva clave de acceso segura para este usuario."
        >
          <form onSubmit={handleResetPassword} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#1d1d1f] uppercase tracking-wider mb-1.5">
                Nueva Contraseña * (Mínimo 6 caracteres)
              </label>
              <Input
                type="password"
                placeholder="Ingresa la nueva clave..."
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#f0f0f0]">
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => {
                  setIsResetModalOpen(false);
                  setSelectedUserForReset(null);
                }}
              >
                Cancelar
              </Button>
              <Button type="submit" variant="primary" size="md" disabled={isSubmitting}>
                {isSubmitting ? "Guardando..." : "Actualizar Contraseña"}
              </Button>
            </div>
          </form>
        </Modal>
      )}
    </div>
  );
}
