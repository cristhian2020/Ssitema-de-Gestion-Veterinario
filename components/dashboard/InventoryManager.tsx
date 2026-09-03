"use client";

import * as React from "react";
import {
  Package,
  Plus,
  AlertTriangle,
  Search,
  MinusCircle,
  PlusCircle,
  Pill,
  Tag,
  Clock,
  CheckCircle2,
  DollarSign,
} from "lucide-react";
import {
  type InventoryItemWithAlert,
  updateStockAction,
  createInventoryItemAction,
} from "@/lib/actions/inventory";
import { type Service } from "@/db/schema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { useToast } from "@/components/ui/toast";
import { formatCurrency } from "@/lib/utils";

interface InventoryManagerProps {
  initialInventory: InventoryItemWithAlert[];
  services: Service[];
}

export function InventoryManager({
  initialInventory,
  services,
}: InventoryManagerProps) {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = React.useState<"inventory" | "services">("inventory");
  const [inventory, setInventory] = React.useState(initialInventory);
  const [searchTerm, setSearchTerm] = React.useState("");
  const [categoryFilter, setCategoryFilter] = React.useState("all");

  // Modal State
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // New Item Form
  const [name, setName] = React.useState("");
  const [sku, setSku] = React.useState("");
  const [category, setCategory] = React.useState<"medicine" | "vaccine" | "food" | "supply">("medicine");
  const [currentStock, setCurrentStock] = React.useState(10);
  const [minStock, setMinStock] = React.useState(5);
  const [unit, setUnit] = React.useState("unidades");
  const [unitCost, setUnitCost] = React.useState("");
  const [salePrice, setSalePrice] = React.useState("");
  const [expiryDate, setExpiryDate] = React.useState("");

  const filteredInventory = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === "all" || item.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleStockDelta = async (itemId: number, delta: number) => {
    // Optimistic update
    setInventory((prev) =>
      prev.map((item) => {
        if (item.id === itemId) {
          const newStock = Math.max(0, item.currentStock + delta);
          return {
            ...item,
            currentStock: newStock,
            isLowStock: newStock <= item.minStock,
          };
        }
        return item;
      })
    );

    try {
      const res = await updateStockAction(itemId, delta);
      if (!res.success) {
        toast("No se pudo actualizar el stock", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    }
  };

  const handleCreateItem = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await createInventoryItemAction({
        name,
        sku,
        category,
        currentStock,
        minStock,
        unit,
        unitCost,
        salePrice,
        expiryDate: expiryDate || undefined,
      });

      if (res.success && res.item) {
        toast(`¡${name} agregado al inventario!`, "success");
        setInventory((prev) => [
          { ...res.item!, isLowStock: res.item!.currentStock <= res.item!.minStock },
          ...prev,
        ]);
        setIsModalOpen(false);
        // Reset
        setName("");
        setSku("");
        setUnitCost("");
        setSalePrice("");
        setExpiryDate("");
      } else {
        toast(res.error || "Error al agregar producto", "error");
      }
    } catch {
      toast("Error de conexión", "error");
    } finally {
      setIsSubmitting(false);
    }
  };

  const categoryLabels: Record<string, string> = {
    medicine: "Medicamento",
    vaccine: "Biológico / Vacuna",
    food: "Alimento Terapéutico",
    supply: "Insumo Clínico",
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold text-[#1d1d1f] tracking-tight">
            Inventario Farmacéutico & Servicios
          </h2>
          <p className="text-sm text-[#7a7a7a]">
            Control de existencias mínimas, reposición de medicamentos y catálogo de tarifas
          </p>
        </div>

        {activeTab === "inventory" && (
          <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)}>
            <Plus className="w-4 h-4" />
            Nuevo Ítem de Stock
          </Button>
        )}
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-[#e5e5ea] shadow-xs">
        {/* Apple Pill Tabs */}
        <div className="flex items-center bg-[#f5f5f7] p-1 rounded-xl w-fit">
          <button
            type="button"
            onClick={() => setActiveTab("inventory")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "inventory"
                ? "bg-white text-[#0066cc] shadow-xs"
                : "text-[#7a7a7a] hover:text-[#1d1d1f]"
            }`}
          >
            Inventario & Farmacia ({inventory.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("services")}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all ${
              activeTab === "services"
                ? "bg-white text-[#0066cc] shadow-xs"
                : "text-[#7a7a7a] hover:text-[#1d1d1f]"
            }`}
          >
            Catálogo de Servicios ({services.length})
          </button>
        </div>

        {activeTab === "inventory" && (
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-[#8e8e93] absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Buscar por nombre o SKU..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-9 pl-9 pr-4 rounded-xl bg-[#f5f5f7] text-xs text-[#1d1d1f] placeholder:text-[#8e8e93] focus:outline-none focus:ring-2 focus:ring-[#0066cc]/20"
              />
            </div>

            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="h-9 px-3 rounded-xl bg-[#f5f5f7] text-xs font-medium text-[#1d1d1f] border-none focus:ring-2 focus:ring-[#0066cc]/20 cursor-pointer"
            >
              <option value="all">Todas las Categorías</option>
              <option value="medicine">Medicamentos</option>
              <option value="vaccine">Vacunas</option>
              <option value="food">Alimentos</option>
              <option value="supply">Insumos</option>
            </select>
          </div>
        )}
      </div>

      {/* TAB 1: INVENTARIO */}
      {activeTab === "inventory" && (
        <div className="bg-white rounded-3xl border border-[#e5e5ea] shadow-xs overflow-hidden">
          <div className="divide-y divide-[#f0f0f0]">
            {filteredInventory.length === 0 ? (
              <div className="p-12 text-center text-sm text-[#7a7a7a]">
                No se encontraron productos en el inventario.
              </div>
            ) : (
              filteredInventory.map((item) => (
                <div
                  key={item.id}
                  className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-[#fafafc] transition-colors"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${
                        item.isLowStock
                          ? "bg-[#ff3b30]/10 text-[#ff3b30]"
                          : "bg-[#0066cc]/10 text-[#0066cc]"
                      }`}
                    >
                      {item.isLowStock ? (
                        <AlertTriangle className="w-5 h-5" />
                      ) : (
                        <Pill className="w-5 h-5" />
                      )}
                    </div>

                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-sm text-[#1d1d1f]">
                          {item.name}
                        </span>
                        <span className="text-xs font-mono text-[#8e8e93]">
                          [{item.sku}]
                        </span>
                        <Badge variant="gray" size="sm">
                          {categoryLabels[item.category] || item.category}
                        </Badge>
                        {item.isLowStock && (
                          <Badge variant="red" size="sm">
                            Stock Bajo (Mín: {item.minStock})
                          </Badge>
                        )}
                      </div>

                      <div className="text-xs text-[#7a7a7a] mt-1 flex items-center gap-3 flex-wrap">
                        <span>
                          Venta:{" "}
                          <strong className="text-[#1d1d1f]">
                            {formatCurrency(item.salePrice)}
                          </strong>
                        </span>
                        <span>
                          Costo: <strong>{formatCurrency(item.unitCost)}</strong>
                        </span>
                        {item.expiryDate && <span>Vence: {item.expiryDate}</span>}
                      </div>
                    </div>
                  </div>

                  {/* Stock Quick Adjustment */}
                  <div className="flex items-center gap-3 self-end md:self-center">
                    <div className="text-right mr-2">
                      <div className="text-lg font-bold text-[#1d1d1f]">
                        {item.currentStock}{" "}
                        <span className="text-xs font-normal text-[#7a7a7a]">
                          {item.unit}
                        </span>
                      </div>
                      <div className="text-[11px] text-[#8e8e93]">
                        Mínimo: {item.minStock}
                      </div>
                    </div>

                    <div className="flex items-center gap-1 bg-[#f5f5f7] p-1 rounded-xl">
                      <button
                        type="button"
                        onClick={() => handleStockDelta(item.id, -1)}
                        className="p-1 rounded-lg text-[#7a7a7a] hover:text-[#ff3b30] hover:bg-white transition-all cursor-pointer"
                        title="Restar 1 unidad"
                      >
                        <MinusCircle className="w-5 h-5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleStockDelta(item.id, 1)}
                        className="p-1 rounded-lg text-[#7a7a7a] hover:text-[#0066cc] hover:bg-white transition-all cursor-pointer"
                        title="Sumar 1 unidad"
                      >
                        <PlusCircle className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* TAB 2: CATÁLOGO DE SERVICIOS */}
      {activeTab === "services" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((svc) => (
            <div
              key={svc.id}
              className="bg-white rounded-3xl border border-[#e5e5ea] p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between">
                  <Badge variant="blue" size="sm">
                    {svc.category}
                  </Badge>
                  <div className="flex items-center gap-1 text-xs text-[#7a7a7a]">
                    <Clock className="w-3.5 h-3.5" />
                    {svc.durationMinutes} min
                  </div>
                </div>

                <h3 className="text-base font-semibold text-[#1d1d1f] tracking-tight mt-3">
                  {svc.name}
                </h3>
                <p className="text-xs text-[#7a7a7a] mt-1 leading-relaxed">
                  {svc.description || "Servicio veterinario especializado."}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-[#f0f0f0] flex items-center justify-between">
                <span className="text-xs text-[#8e8e93]">Tarifa Estándar:</span>
                <span className="text-lg font-bold text-[#0066cc]">
                  {formatCurrency(svc.price)}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal Agregar Producto al Inventario */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Agregar Nuevo Producto al Inventario"
        description="Ingresa datos de lote, código SKU, precio y límites de alerta de stock"
        maxWidth="lg"
      >
        <form onSubmit={handleCreateItem} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Nombre del Producto"
              placeholder="Ej: Meloxicam 0.5%, Vacuna Séxtuple..."
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />

            <Input
              label="Código SKU / Identificador"
              placeholder="Ej: MED-MELOX-15"
              value={sku}
              onChange={(e) => setSku(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Select
              label="Categoría"
              value={category}
              onChange={(e) => setCategory(e.target.value as any)}
              required
            >
              <option value="medicine">Medicamento</option>
              <option value="vaccine">Vacuna / Biológico</option>
              <option value="food">Alimento Terapéutico</option>
              <option value="supply">Insumo Clínico / Material</option>
            </Select>

            <Input
              label="Unidad de Medida"
              placeholder="Ej: cajas, frascos, comprimidos, kg"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <Input
              label="Stock Inicial"
              type="number"
              min={0}
              value={currentStock}
              onChange={(e) => setCurrentStock(Number(e.target.value))}
              required
            />

            <Input
              label="Stock Mínimo (Alerta Crítica)"
              type="number"
              min={1}
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <Input
              label="Costo Unitario ($)"
              placeholder="Ej: 4500"
              value={unitCost}
              onChange={(e) => setUnitCost(e.target.value)}
              required
            />

            <Input
              label="Precio de Venta ($)"
              placeholder="Ej: 7800"
              value={salePrice}
              onChange={(e) => setSalePrice(e.target.value)}
              required
            />

            <Input
              label="Fecha de Vencimiento"
              type="date"
              value={expiryDate}
              onChange={(e) => setExpiryDate(e.target.value)}
            />
          </div>

          <div className="pt-4 flex items-center justify-end gap-3 border-t">
            <Button
              type="button"
              variant="secondary"
              onClick={() => setIsModalOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit" variant="primary" disabled={isSubmitting}>
              {isSubmitting ? "Guardando..." : "Registrar Ítem"}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
