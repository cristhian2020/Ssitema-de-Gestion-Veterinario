import { PetCardPortal } from "@/components/portal/PetCardPortal";

export const metadata = {
  title: "Cartilla Sanitaria Digital — Huellitas Felices",
  description: "Consulta las vacunas, recetas médicas y atenciones de tu mascota desde tu celular.",
};

export default function CartillaPage() {
  return <PetCardPortal />;
}
