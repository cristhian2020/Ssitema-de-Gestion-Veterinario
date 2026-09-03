"use client";

import * as React from "react";
import {
  PawPrint,
  Plus,
  Search,
  MessageCircle,
  Mail,
  Scale,
  Calendar,
  AlertTriangle,
  QrCode,
  User,
  Heart,
  FileText,
  Edit3,
} from "lucide-react";
import { type PetWithOwner, createPetAction, updatePetAction, createOwnerAction } from "@/lib/actions/pets";
import { type Owner } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";
import Link from "next/link";

interface PetsManagerProps {
  initialPets: PetWithOwner[];
  owners: Owner[];
}

export function PetsManager({ initialPets, owners: initialOwners }: PetsManagerProps) {
  const { toast } = useToast();
  const [pets, setPets] = React.useState(initialPets);
  const [owners, setOwners] = React.useState(initialOwners);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [speciesFilter, setSpeciesFilter] = React.useState("all");

  // Modals
  const [isPetModalOpen, setIsPetModalOpen] = React.useState(false);
  const [isOwnerModalOpen, setIsOwnerModalOpen] = React.useState(false);
  const [selectedPetDetail, setSelectedPetDetail] = React.useState<PetWithOwner | null>(null);
  const [editingPetId, setEditingPetId] = React.useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Pet Form State (New or Edit)
  const [ownerId, setOwnerId] = React.useState<string>("");
  const [petName, setPetName] = React.useState("");
  const [species, setSpecies] = React.useState("Perro");
  const [breed, setBreed] = React.useState("");
  const [sex, setSex] = React.useState<"Macho" | "Hembra">("Macho");
  const [birthDate, setBirthDate] = React.useState("");
  const [weightKg, setWeightKg] = React.useState("");
  const [microchip, setMicrochip] = React.useState("");
  const [allergies, setAllergies] = React.useState("");
  const [photoUrl, setPhotoUrl] = React.useState("");
  const [notes, setNotes] = React.useState("");

  // New Owner Form State
  const [ownerFullName, setOwnerFullName] = React.useState("");
  const [ownerEmail, setOwnerEmail] = React.useState("");
  const [ownerPhone, setOwnerPhone] = React.useState("");
  const [ownerWhatsapp, setOwnerWhatsapp] = React.useState("");
  const [ownerAddress, setOwnerAddress] = React.useState("");
  const [ownerCity, setOwnerCity] = React.useState("");
  const [ownerNotes, setOwnerNotes] = React.useState("");

  React.useEffect(() => {
    setPets(initialPets);
  }, [initialPets]);

  const filteredPets = pets.filter((pet) => {
    const matchesSearch =
      pet.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.breed.toLowerCase().includes(searchTerm.toLowerCase()) ||
      pet.owner?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pet.microchip && pet.microchip.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesSpecies = speciesFilter === "all" || pet.species === speciesFilter;
    return matchesSearch && matchesSpecies;
  });

  const handleOpenNewPetModal = () => {
    setEditingPetId(null);
    setOwnerId("");
    setPetName("");
    setSpecies("Perro");
    setBreed("");
    setSex("Macho");
    setBirthDate("");
    setWeightKg("");
    setMicrochip("");
    setAllergies("");
    setPhotoUrl("");
    setNotes("");
    setIsPetModalOpen(true);
  };

  const handleEditPet = (pet: PetWithOwner) => {
    setEditingPetId(pet.id);
    setOwnerId(String(pet.ownerId));
    setPetName(pet.name);
    setSpecies(pet.species);
    setBreed(pet.breed);
    setSex(pet.sex as "Macho" | "Hembra");
    setBirthDate(pet.birthDate || "");
    setWeightKg(String(pet.weightKg));
    setMicrochip(pet.microchip || "");
    setAllergies(pet.allergies || "");
    setPhotoUrl(pet.photoUrl || "");
    setNotes(pet.notes || "");
    setIsPetModalOpen(true);
  };

  const handlePetSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!ownerId) {
      toast("Selecciona un dueño para la mascota", "error");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingPetId) {
        const res = await updatePetAction(editingPetId, {
          ownerId: Number(ownerId),
          name: petName,
          species,
          breed,
          sex,
          birthDate: birthDate || undefined,
          weightKg,
          microchip: microchip || undefined,
          allergies: allergies || undefined,
          photoUrl: photoUrl || undefined,
          notes: notes || undefined,
        });

        if (res.success && res.pet) {
          toast(`¡Datos de ${petName} actualizados correctamente!`, "success");
          setPets((prev) =>
            prev.map((p) =>
              p.id === editingPetId
                ? ({
                    ...p,
                    ...res.pet,
                    owner: owners.find((o) => o.id === Number(ownerId)) || p.owner,
                  } as PetWithOwner)
                : p
            )
          );
          if (selectedPetDetail && selectedPetDetail.id === editingPetId) {
            setSelectedPetDetail({
              ...selectedPetDetail,
              ...res.pet,
              owner: owners.find((o) => o.id === Number(ownerId)) || selectedPetDetail.owner,
            } as PetWithOwner);
          }
          setIsPetModalOpen(false);
          setEditingPetId(null);
        } else {
          toast(res.error || "Error al actualizar la mascota", "error");
        }
      } else {
        const res = await createPetAction({
          ownerId: Number(ownerId),
          name: petName,
          species,
          breed,
          sex,
          birthDate: birthDate || undefined,
          weightKg,
          microchip: microchip || undefined,
          allergies: allergies || undefined,
          photoUrl: photoUrl || undefined,
          notes: notes || undefined,
        });

        if (res.success && res.pet) {
          toast(`¡${petName} registrado con éxito!`, "success");
          setIsPetModalOpen(false);
          // Reset
          setPetName("");
          setBreed("");
          setWeightKg("");
          setMicrochip("");
          setAllergies("");
          setPhotoUrl("");
          setNotes("");
        } else {
          toast(res.error || "Error al registrar la mascota", "error");
        }
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCreateOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createOwnerAction({
        fullName: ownerFullName,
        email: ownerEmail,
        phone: ownerPhone,
        whatsapp: ownerWhatsapp || ownerPhone,
        address: ownerAddress || undefined,
        city: ownerCity || undefined,
        notes: ownerNotes || undefined,
      });

      if (res.success && res.owner) {
        toast(`Propietario ${res.owner.fullName} registrado`, "success");
        setOwners((prev) => [res.owner!, ...prev]);
        setOwnerId(String(res.owner.id));
        setIsOwnerModalOpen(false);
        // Reset
        setOwnerFullName("");
        setOwnerEmail("");
        setOwnerPhone("");
        setOwnerWhatsapp("");
      } else {
        toast(res.error || "Error al registrar propietario", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            Directorio de Pacientes y Dueños
          </h2>
          <p className="text-sm text-[#7a7a7a]">
            Perfiles clínicos, chips identificadores, control de alergias y contacto directo
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            size="md"
            onClick={() => setIsOwnerModalOpen(true)}
          >
            <User className="w-4 h-4" />
            Nuevo Propietario
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={handleOpenNewPetModal}
          >
            <Plus className="w-4 h-4" />
            Nueva Mascota
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-2xl border border-[#e5e5ea] flex flex-col sm:flex-row items-center gap-3 shadow-xs">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-[#8e8e93] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Buscar por nombre, chip, dueño o raza..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full h-10 pl-10 pr-4 rounded-xl bg-[#f5f5f7] text-sm text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
          />
        </div>

        <select
          value={speciesFilter}
          onChange={(e) => setSpeciesFilter(e.target.value)}
          className="h-10 px-3 rounded-xl bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f] border-none focus:ring-2 focus:ring-[#0066cc]/20 cursor-pointer w-full sm:w-auto"
        >
          <option value="all">Todas las Especies</option>
          <option value="Perro">Caninos (Perros)</option>
          <option value="Gato">Felinos (Gatos)</option>
          <option value="Ave">Aves</option>
          <option value="Exótico">Exóticos / Otros</option>
        </select>
      </div>

      {/* Pets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredPets.map((pet) => {
          const whatsappOwnerUrl = `https://wa.me/${pet.owner?.whatsapp?.replace(/[^\d]/g, "")}`;
          const mailtoUrl = `mailto:${pet.owner?.email}?subject=Veterinaria Huellitas Felices - Consulta sobre ${pet.name}`;

          return (
            <div
              key={pet.id}
              className="bg-white rounded-3xl border border-[#e5e5ea] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Header card with photo & basic tags */}
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-14 h-14 rounded-2xl overflow-hidden bg-[#f5f5f7] border border-[#e5e5ea] shrink-0">
                      {pet.photoUrl ? (
                        <img
                          src={pet.photoUrl}
                          alt={pet.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[#0066cc]">
                          <PawPrint className="w-6 h-6" />
                        </div>
                      )}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-[#1d1d1f] tracking-tight">
                        {pet.name}
                      </h3>
                      <p className="text-xs text-[#7a7a7a]">
                        {pet.species} • {pet.breed}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="gray" size="sm">
                          {pet.sex}
                        </Badge>
                        <Badge variant="blue" size="sm">
                          {pet.weightKg} kg
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Details & Chip */}
                <div className="mt-4 pt-4 border-t border-[#f0f0f0] space-y-2 text-xs text-[#7a7a7a]">
                  {pet.microchip ? (
                    <div className="flex items-center justify-between bg-[#0066cc]/5 p-2 rounded-xl">
                      <div className="flex items-center gap-1.5 text-[#0066cc] font-medium">
                        <QrCode className="w-3.5 h-3.5" />
                        <span>Chip:</span>
                      </div>
                      <span className="font-mono font-bold text-[#1d1d1f]">
                        {pet.microchip}
                      </span>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleEditPet(pet)}
                      className="w-full py-1.5 px-2.5 rounded-xl border border-dashed border-[#d2d2d7] text-[#0066cc] hover:bg-[#f5f5f7] flex items-center justify-center gap-1.5 text-[11px] font-medium transition-colors cursor-pointer"
                    >
                      <QrCode className="w-3.5 h-3.5" />
                      + Asignar Nº de Microchip
                    </button>
                  )}

                  {pet.allergies ? (
                    <div className="bg-[#ff3b30]/10 text-[#d70015] p-2.5 rounded-xl flex items-start gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold block">Alergias Conocidas:</span>
                        <span>{pet.allergies}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="text-[11px] text-[#8e8e93] px-1">
                      Sin alergias registradas
                    </div>
                  )}

                  {/* Owner information */}
                  <div className="pt-2 flex items-center justify-between text-[#1d1d1f]">
                    <div className="flex items-center gap-1.5">
                      <User className="w-3.5 h-3.5 text-[#8e8e93]" />
                      <span className="font-medium">{pet.owner?.fullName}</span>
                    </div>
                    <span className="text-[11px] text-[#7a7a7a]">{pet.owner?.city || "Bs. As."}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-4 border-t border-[#f0f0f0] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedPetDetail(pet)}
                    className="text-xs font-semibold text-[#0066cc] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    Ficha
                  </button>
                  <button
                    type="button"
                    onClick={() => handleEditPet(pet)}
                    className="text-xs font-medium text-[#7a7a7a] hover:text-[#0066cc] flex items-center gap-1 cursor-pointer"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                    Editar
                  </button>
                </div>

                <div className="flex items-center gap-1.5">
                  <a
                    href={whatsappOwnerUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 rounded-full bg-[#25D366]/10 text-[#128C7E] hover:bg-[#25D366]/20 transition-colors"
                    title="Chatear por WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </a>
                  <a
                    href={mailtoUrl}
                    className="p-2 rounded-full bg-[#0066cc]/10 text-[#0066cc] hover:bg-[#0066cc]/20 transition-colors"
                    title="Enviar Correo Electrónico"
                  >
                    <Mail className="w-4 h-4" />
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal Ficha Completa de Mascota */}
      {selectedPetDetail && (
        <Modal
          isOpen={!!selectedPetDetail}
          onClose={() => setSelectedPetDetail(null)}
          title={`Ficha Clínica: ${selectedPetDetail.name}`}
          description={`Identificador único de paciente #${selectedPetDetail.id}`}
          maxWidth="lg"
        >
          <div className="space-y-4 text-sm">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl overflow-hidden bg-[#f5f5f7] border shrink-0">
                {selectedPetDetail.photoUrl ? (
                  <img
                    src={selectedPetDetail.photoUrl}
                    alt={selectedPetDetail.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-[#0066cc]">
                    <PawPrint className="w-8 h-8" />
                  </div>
                )}
              </div>
              <div>
                <h4 className="text-xl font-bold text-[#1d1d1f]">{selectedPetDetail.name}</h4>
                <p className="text-xs text-[#7a7a7a]">
                  {selectedPetDetail.species} • {selectedPetDetail.breed} • {selectedPetDetail.sex}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <Badge variant="blue">{selectedPetDetail.weightKg} kg</Badge>
                  {selectedPetDetail.birthDate && (
                    <Badge variant="gray">Nac: {formatDate(selectedPetDetail.birthDate)}</Badge>
                  )}
                </div>
              </div>
            </div>

            <div className="bg-[#f5f5f7] p-4 rounded-2xl space-y-2">
              <div className="font-semibold text-xs uppercase text-[#8e8e93] tracking-wider">
                Datos del Propietario
              </div>
              <div className="text-sm font-medium text-[#1d1d1f]">
                {selectedPetDetail.owner?.fullName}
              </div>
              <div className="text-xs text-[#7a7a7a]">
                Email: {selectedPetDetail.owner?.email} | Tel: {selectedPetDetail.owner?.phone}
              </div>
              <div className="text-xs text-[#7a7a7a]">
                Dirección: {selectedPetDetail.owner?.address || "No especificada"}
              </div>
            </div>

            {/* Microchip Section */}
            {selectedPetDetail.microchip ? (
              <div className="p-3 bg-[#0066cc]/5 border border-[#0066cc]/20 rounded-2xl flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <QrCode className="w-4 h-4 text-[#0066cc]" />
                  <span className="text-xs font-semibold text-[#1d1d1f]">Microchip ISO Identificador:</span>
                </div>
                <span className="font-mono text-xs font-bold text-[#0066cc]">
                  {selectedPetDetail.microchip}
                </span>
              </div>
            ) : (
              <div className="p-3 border border-dashed border-[#d2d2d7] rounded-2xl flex items-center justify-between bg-[#fafafc]">
                <div className="flex items-center gap-2 text-xs text-[#7a7a7a]">
                  <QrCode className="w-4 h-4" />
                  <span>Sin microchip registrado</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const p = selectedPetDetail;
                    setSelectedPetDetail(null);
                    handleEditPet(p);
                  }}
                  className="text-xs font-semibold text-[#0066cc] hover:underline cursor-pointer"
                >
                  + Asignar Microchip Ahora
                </button>
              </div>
            )}

            {/* Allergies Section */}
            {selectedPetDetail.allergies ? (
              <div className="p-3.5 bg-[#ff3b30]/10 border border-[#ff3b30]/20 rounded-2xl text-xs text-[#d70015]">
                <strong className="block font-semibold mb-1">
                  ⚠️ Alerta de Alergias e Intolerancias Clínicas:
                </strong>
                {selectedPetDetail.allergies}
              </div>
            ) : (
              <div className="p-3 border border-dashed border-[#d2d2d7] rounded-2xl flex items-center justify-between bg-[#fafafc]">
                <div className="flex items-center gap-2 text-xs text-[#7a7a7a]">
                  <AlertTriangle className="w-4 h-4" />
                  <span>Sin alergias conocidas</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    const p = selectedPetDetail;
                    setSelectedPetDetail(null);
                    handleEditPet(p);
                  }}
                  className="text-xs font-semibold text-[#0066cc] hover:underline cursor-pointer"
                >
                  + Registrar Alergia
                </button>
              </div>
            )}

            {selectedPetDetail.notes && (
              <div className="p-3 bg-white border border-[#e5e5ea] rounded-2xl text-xs text-[#333333]">
                <strong className="block font-semibold mb-1 text-[#1d1d1f]">Notas Médicas / Conducta:</strong>
                {selectedPetDetail.notes}
              </div>
            )}

            {/* Quick Actions Footer */}
            <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-[#f0f0f0]">
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    const p = selectedPetDetail;
                    setSelectedPetDetail(null);
                    handleEditPet(p);
                  }}
                  className="w-full sm:w-auto"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#0066cc]" />
                  Editar Datos (Chip / Peso / Alergias)
                </Button>
              </div>
              <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                <Link href="/dashboard/historial">
                  <Button variant="outline" size="sm">
                    + Ver Historial / Vacunas
                  </Button>
                </Link>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => setSelectedPetDetail(null)}
                >
                  Cerrar
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Registrar / Editar Mascota */}
      <Modal
        isOpen={isPetModalOpen}
        onClose={() => {
          setIsPetModalOpen(false);
          setEditingPetId(null);
        }}
        title={editingPetId ? `Editar Mascota: ${petName}` : "Registrar Nuevo Paciente"}
        description={
          editingPetId
            ? "Actualiza el microchip, alergias, peso actual, fecha de nacimiento o notas"
            : "Ingresa los datos biológicos y de identificación de la mascota"
        }
        maxWidth="lg"
      >
        <form onSubmit={handlePetSubmit} className="space-y-4">
          <div className="flex items-end gap-2">
            <div className="flex-1">
              <Select
                label="Propietario / Dueño"
                value={ownerId}
                onChange={(e) => setOwnerId(e.target.value)}
                required
              >
                <option value="">Selecciona un propietario existente...</option>
                {owners.map((o) => (
                  <option key={o.id} value={o.id}>
                    {o.fullName} ({o.email} - {o.phone})
                  </option>
                ))}
              </Select>
            </div>
            {!editingPetId && (
              <Button
                type="button"
                variant="secondary"
                size="md"
                onClick={() => setIsOwnerModalOpen(true)}
                title="Registrar un nuevo dueño"
              >
                + Nuevo Dueño
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre de la Mascota"
              placeholder="Ej: Milo, Luna, Rocky..."
              value={petName}
              onChange={(e) => setPetName(e.target.value)}
              required
            />

            <Select
              label="Especie"
              value={species}
              onChange={(e) => setSpecies(e.target.value)}
              required
            >
              <option value="Perro">Perro (Canino)</option>
              <option value="Gato">Gato (Felino)</option>
              <option value="Ave">Ave</option>
              <option value="Exótico">Exótico / Roedor</option>
              <option value="Otro">Otro</option>
            </Select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Raza"
              placeholder="Ej: Mestizo, Siamés..."
              value={breed}
              onChange={(e) => setBreed(e.target.value)}
              required
            />

            <Select
              label="Sexo"
              value={sex}
              onChange={(e) => setSex(e.target.value as "Macho" | "Hembra")}
              required
            >
              <option value="Macho">Macho</option>
              <option value="Hembra">Hembra</option>
            </Select>

            <Input
              label="Peso Actual (kg)"
              placeholder="Ej: 14.5"
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Fecha de Nacimiento"
              type="date"
              value={birthDate}
              onChange={(e) => setBirthDate(e.target.value)}
            />

            <Input
              label="Nº de Microchip ISO (Identificador)"
              placeholder="Ej: 981098102938475"
              value={microchip}
              onChange={(e) => setMicrochip(e.target.value)}
            />
          </div>

          <Input
            label="Alergias o Contraindicaciones"
            placeholder="Ej: Alergia a cefalexina, intolerancia a pollo..."
            value={allergies}
            onChange={(e) => setAllergies(e.target.value)}
          />

          <Input
            label="URL Foto de Perfil (Opcional)"
            placeholder="https://images.unsplash.com/..."
            value={photoUrl}
            onChange={(e) => setPhotoUrl(e.target.value)}
          />

          <Textarea
            label="Notas Clínicas / Temperamento"
            placeholder="Ej: Se asusta con ruidos fuertes, dócil con otros animales..."
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
          />

          <div className="pt-4 flex items-center justify-end gap-3 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => {
                setIsPetModalOpen(false);
                setEditingPetId(null);
              }}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting
                ? "Guardando..."
                : editingPetId
                ? "Guardar Cambios"
                : "Guardar Mascota"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal Registrar Nuevo Propietario */}
      <Modal
        isOpen={isOwnerModalOpen}
        onClose={() => setIsOwnerModalOpen(false)}
        title="Registrar Nuevo Propietario"
        description="Ingresa la información de contacto para recordatorios automáticos por WhatsApp"
        maxWidth="md"
      >
        <form onSubmit={handleCreateOwner} className="space-y-4">
          <Input
            label="Nombre Completo"
            placeholder="Ej: Juan Pérez"
            value={ownerFullName}
            onChange={(e) => setOwnerFullName(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Correo Electrónico"
              type="email"
              placeholder="juan@email.com"
              value={ownerEmail}
              onChange={(e) => setOwnerEmail(e.target.value)}
              required
            />

            <Input
              label="Teléfono Principal"
              placeholder="Ej: +54 9 11 5544-3322"
              value={ownerPhone}
              onChange={(e) => setOwnerPhone(e.target.value)}
              required
            />
          </div>

          <Input
            label="WhatsApp (para recordatorios automáticos)"
            placeholder="Ej: 5491155443322 (con código de país)"
            value={ownerWhatsapp}
            onChange={(e) => setOwnerWhatsapp(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Dirección"
              placeholder="Calle y número"
              value={ownerAddress}
              onChange={(e) => setOwnerAddress(e.target.value)}
            />
            <Input
              label="Ciudad / Barrio"
              placeholder="Ej: Palermo, CABA"
              value={ownerCity}
              onChange={(e) => setOwnerCity(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsOwnerModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Registrar Dueño"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
