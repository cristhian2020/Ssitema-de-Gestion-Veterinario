"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { SessionUser } from "@/lib/auth/session";
import { logoutAction, loginAction } from "@/lib/actions/auth";

interface AuthContextType {
  user: SessionUser | null;
  role: "admin" | "vet" | "receptionist" | "client";
  isAdmin: boolean;
  isVet: boolean;
  isReceptionist: boolean;
  logout: () => Promise<void>;
  switchUserFast: (email: string) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode;
  initialUser: SessionUser | null;
}) {
  const [user, setUser] = useState<SessionUser | null>(initialUser);
  const router = useRouter();

  useEffect(() => {
    setUser(initialUser);
  }, [initialUser]);

  const handleLogout = async () => {
    await logoutAction();
    setUser(null);
    window.location.href = "/login";
  };

  const switchUserFast = async (email: string) => {
    const res = await loginAction({ email, password: "Huellitas2026!" });
    if (res.success && res.user) {
      setUser(res.user);
      window.location.reload();
    }
  };

  const role = user?.role || "vet";
  const isAdmin = role === "admin";
  const isVet = role === "vet";
  const isReceptionist = role === "receptionist";

  return (
    <AuthContext.Provider
      value={{
        user,
        role,
        isAdmin,
        isVet,
        isReceptionist,
        logout: handleLogout,
        switchUserFast,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
