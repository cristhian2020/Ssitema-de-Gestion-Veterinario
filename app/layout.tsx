import type { Metadata } from "next";
import "./globals.css";
import { ToastProvider } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "Veterinaria Huellitas Felices | Gestión Clínica & Reservas",
  description:
    "Cuidado veterinario integral con tecnología de vanguardia. Gestión de historias clínicas, vacunación, cirugías y reservas de turnos online.",
  keywords: [
    "veterinaria",
    "citas veterinarias",
    "historial clínico",
    "vacunas mascotas",
    "urgencias veterinarias",
  ],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className="h-full antialiased scroll-smooth">
      <body className="min-h-full flex flex-col bg-[#f5f5f7] text-[#1d1d1f]">
        <ToastProvider>{children}</ToastProvider>
      </body>
    </html>
  );
}
