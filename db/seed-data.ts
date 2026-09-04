import { db } from "./index";
import { hashPassword } from "../lib/auth/password";
import {
  users,
  owners,
  pets,
  appointments,
  medicalRecords,
  vaccines,
  services,
  inventoryItems,
} from "./schema";

export async function seedDatabase() {
  console.log("🌱 Iniciando siembra de datos de Huellitas Felices...");

  const defaultPasswordHash = await hashPassword("Huellitas2026!");

  // 1. Usuarios / Personal Clínico
  const insertedUsers = await db
    .insert(users)
    .values([
      {
        name: "Dra. Valentina Morales",
        email: "valentina.morales@huellitasfelices.com",
        passwordHash: defaultPasswordHash,
        role: "vet",
        phone: "+54 9 11 4455-8899",
        specialty: "Cirugía & Medicina Felina",
        avatarUrl: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=150&auto=format&fit=crop&q=80",
        active: true,
      },
      {
        name: "Dr. Mateo Rossi",
        email: "mateo.rossi@huellitasfelices.com",
        passwordHash: defaultPasswordHash,
        role: "vet",
        phone: "+54 9 11 7722-3344",
        specialty: "Medicina General & Ecografía",
        avatarUrl: "https://images.unsplash.com/photo-1622253692010-333f2da6031d?w=150&auto=format&fit=crop&q=80",
        active: true,
      },
      {
        name: "Camila Torres",
        email: "camila.recepcion@huellitasfelices.com",
        passwordHash: defaultPasswordHash,
        role: "receptionist",
        phone: "+54 9 11 9988-1122",
        specialty: "Atención al Cliente & Triaje",
        avatarUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80",
        active: true,
      },
      {
        name: "Dr. Fernando Ruiz",
        email: "admin@huellitasfelices.com",
        passwordHash: defaultPasswordHash,
        role: "admin",
        phone: "+591 62640539",
        specialty: "Dirección Médica & Cirugía Avanzada",
        avatarUrl: "https://images.unsplash.com/photo-1537368910025-700350fe46c7?w=150&auto=format&fit=crop&q=80",
        active: true,
      },
    ])
    .returning();

  const vet1 = insertedUsers[0];
  const vet2 = insertedUsers[1];

  // 2. Propietarios (Dueños)
  const insertedOwners = await db
    .insert(owners)
    .values([
      {
        fullName: "Sofía Gómez Almada",
        documentId: "38920194",
        email: "sofia.gomez@gmail.com",
        phone: "+54 9 11 5566 7788",
        whatsapp: "5491155667788",
        address: "Av. Santa Fe 3421, Palermo",
        city: "Buenos Aires",
        notes: "Dueña muy atenta, prefiere recordatorios por WhatsApp por la mañana.",
      },
      {
        fullName: "Martín Alejandro Benítez",
        documentId: "34112089",
        email: "martin.benitez@outlook.com",
        phone: "+54 9 11 2233 4455",
        whatsapp: "5491122334455",
        address: "Calle Juramento 1850, Belgrano",
        city: "Buenos Aires",
        notes: "Trabaja desde casa, disponible en horarios vespertinos.",
      },
      {
        fullName: "Luciana & Ignacio Pérez",
        documentId: "40192834",
        email: "lucianaperez.arq@gmail.com",
        phone: "+54 9 11 8899 0011",
        whatsapp: "5491188990011",
        address: "Corrientes 4500, Almagro",
        city: "Buenos Aires",
        notes: "Tiene 2 gatos rescatados.",
      },
    ])
    .returning();

  const owner1 = insertedOwners[0];
  const owner2 = insertedOwners[1];
  const owner3 = insertedOwners[2];

  // 3. Pacientes (Mascotas)
  const insertedPets = await db
    .insert(pets)
    .values([
      {
        ownerId: owner1.id,
        name: "Milo",
        species: "Perro",
        breed: "Golden Retriever",
        sex: "Macho",
        birthDate: "2021-04-15",
        weightKg: "31.50",
        microchip: "981098102938475",
        allergies: "Alergia a la Cefalexina y pulgas",
        photoUrl: "https://images.unsplash.com/photo-1552053831-71594a27632d?w=300&auto=format&fit=crop&q=80",
        notes: "Temperamento muy dócil, ansioso durante tormentas.",
      },
      {
        ownerId: owner2.id,
        name: "Luna",
        species: "Gato",
        breed: "Siamés Tradicional",
        sex: "Hembra",
        birthDate: "2022-08-10",
        weightKg: "4.20",
        microchip: "981098107766554",
        allergies: "Intolerancia digestiva a granos de maíz",
        photoUrl: "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=300&auto=format&fit=crop&q=80",
        notes: "Esterilizada. Se estresa en transportadora, usar Feliway en consultorio.",
      },
      {
        ownerId: owner3.id,
        name: "Simba",
        species: "Gato",
        breed: "Europeo Común Atigrado",
        sex: "Macho",
        birthDate: "2023-01-20",
        weightKg: "5.10",
        microchip: "981098104433221",
        allergies: "Sin alergias conocidas",
        photoUrl: "https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=300&auto=format&fit=crop&q=80",
        notes: "Vacunación al día. Control de sarro leve.",
      },
      {
        ownerId: owner1.id,
        name: "Kira",
        species: "Perro",
        breed: "Border Collie",
        sex: "Hembra",
        birthDate: "2020-11-05",
        weightKg: "18.80",
        microchip: "981098109988776",
        allergies: "Sensibilidad a AINES comunes (usar Meloxicam con protector gástrico)",
        photoUrl: "https://images.unsplash.com/photo-1503256207526-0d5d80fa2f47?w=300&auto=format&fit=crop&q=80",
        notes: "Perra de agilidad y alto rendimiento.",
      },
    ])
    .returning();

  const petMilo = insertedPets[0];
  const petLuna = insertedPets[1];
  const petSimba = insertedPets[2];
  const petKira = insertedPets[3];

  // 4. Catálogo de Servicios
  await db.insert(services).values([
    {
      name: "Consulta Médica General",
      category: "Consulta",
      price: "18500.00",
      durationMinutes: 30,
      description: "Examen clínico completo, auscultación cardíaca y pulmonar, pesaje y control de temperatura.",
      active: true,
    },
    {
      name: "Plan Vacunación Canina Séxtuple + Antirrábica",
      category: "Vacunación",
      price: "24000.00",
      durationMinutes: 20,
      description: "Inmunización contra moquillo, parvovirus, hepatitis, leptospira y rabia con certificación oficial.",
      active: true,
    },
    {
      name: "Cirugía de Esterilización Programada",
      category: "Quirúrgico",
      price: "75000.00",
      durationMinutes: 90,
      description: "Cirugía con monitoreo anestésico multiparamétrico continuo, medicación posquirúrgica incluida.",
      active: true,
    },
    {
      name: "Peluquería Canina & Baño Terapéutico",
      category: "Estética",
      price: "19000.00",
      durationMinutes: 60,
      description: "Corte de pelo higiénico, corte de uñas, limpieza de oídos y baño con champú dermatológico.",
      active: true,
    },
    {
      name: "Atención de Urgencia 24/7",
      category: "Urgencias",
      price: "32000.00",
      durationMinutes: 45,
      description: "Triaje inmediato, estabilización de pacientes críticos, oxigenoterapia y fluidoterapia.",
      active: true,
    },
  ]);

  // 5. Inventario con Alertas de Stock Mínimo
  await db.insert(inventoryItems).values([
    {
      name: "Amoxicilina + Ácido Clavulánico 500mg",
      sku: "MED-AMOXI-500",
      category: "medicine",
      currentStock: 4, // Alerta: por debajo de mínimo
      minStock: 10,
      unit: "cajas",
      unitCost: "6800.00",
      salePrice: "11200.00",
      expiryDate: "2027-02-28",
    },
    {
      name: "Meloxicam Gotas 0.5% (15ml)",
      sku: "MED-MELOX-05",
      category: "medicine",
      currentStock: 18,
      minStock: 6,
      unit: "frascos",
      unitCost: "4200.00",
      salePrice: "7500.00",
      expiryDate: "2027-06-30",
    },
    {
      name: "Vacuna Vanguard Plus 5 L4 (Séxtuple Canina)",
      sku: "VAC-VAN-PLUS5",
      category: "vaccine",
      currentStock: 2, // Alerta crítica
      minStock: 12,
      unit: "dosis",
      unitCost: "8900.00",
      salePrice: "15500.00",
      expiryDate: "2026-11-15",
    },
    {
      name: "Pipeta Antiparasitaria Exspot 25-40kg",
      sku: "SUP-EXSPOT-XL",
      category: "supply",
      currentStock: 15,
      minStock: 5,
      unit: "pipetas",
      unitCost: "5400.00",
      salePrice: "9800.00",
      expiryDate: "2027-10-31",
    },
    {
      name: "Royal Canin Gastrointestinal Dog 10kg",
      sku: "ALIM-RC-GASTRO-10",
      category: "food",
      currentStock: 3, // Alerta stock bajo
      minStock: 5,
      unit: "bolsas",
      unitCost: "42000.00",
      salePrice: "59000.00",
      expiryDate: "2026-12-31",
    },
  ]);

  // 6. Citas Programadas
  const now = new Date();
  const todayMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 9, 30);
  const todayNoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 12, 0);
  const todayAfternoon = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 16, 0);
  const tomorrowMorning = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1, 10, 0);

  const insertedAppointments = await db
    .insert(appointments)
    .values([
      {
        petId: petMilo.id,
        ownerId: owner1.id,
        vetId: vet1.id,
        serviceType: "general",
        status: "in_progress",
        scheduledAt: todayMorning,
        durationMinutes: 30,
        reason: "Revisión posquirúrgica y control de herida",
        notes: "Verificar cicatrización y retirar puntos.",
        reminderSent: true,
      },
      {
        petId: petLuna.id,
        ownerId: owner2.id,
        vetId: vet2.id,
        serviceType: "vaccine",
        status: "pending",
        scheduledAt: todayNoon,
        durationMinutes: 20,
        reason: "Aplicación de refuerzo anual Triple Felina",
        notes: "Revisar previamente ganglios y cavidad bucal.",
        reminderSent: true,
      },
      {
        petId: petSimba.id,
        ownerId: owner3.id,
        vetId: vet1.id,
        serviceType: "grooming",
        status: "pending",
        scheduledAt: todayAfternoon,
        durationMinutes: 60,
        reason: "Deslanado y corte de uñas higiénico",
        notes: "Tratar con suavidad, sensible en patas traseras.",
        reminderSent: false,
      },
      {
        petId: petKira.id,
        ownerId: owner1.id,
        vetId: vet2.id,
        serviceType: "surgery",
        status: "pending",
        scheduledAt: tomorrowMorning,
        durationMinutes: 90,
        reason: "Limpieza dental ultrasónica bajo anestesia",
        notes: "Ayuno previo de 8 horas confirmado con la propietaria.",
        reminderSent: true,
      },
    ])
    .returning();

  // 7. Historial Clínico de ejemplo
  await db.insert(medicalRecords).values([
    {
      petId: petMilo.id,
      vetId: vet1.id,
      appointmentId: insertedAppointments[0].id,
      reason: "Chequeo traumatológico y marcha claudicante en pata delantera derecha",
      symptoms: "Dolor leve a la palpación del carpo, claudicación de grado 1/4 tras juego intenso.",
      diagnosis: "Esguince ligamentoso grado 1 en articulación carpo-metacarpiana.",
      treatment: "Reposo relativo por 7 días, crioterapia local 10 min 3 veces al día.",
      prescription: "Meloxicam 0.5% suspensión oral: 6 gotas cada 24 horas por 4 días junto con alimentos. Omeprazol 10mg: 1 comprimido 30 min antes.",
      weightKg: "31.50",
      temperatureC: "38.6",
      internalNotes: "Evolución muy favorable. Propietaria capacitada en frío local.",
    },
    {
      petId: petLuna.id,
      vetId: vet2.id,
      reason: "Control geriátrico preventivo y perfil renal",
      symptoms: "Polidipsia leve referida por el dueño.",
      diagnosis: "Salud general excelente. Creatinina y Urea sérica dentro de rangos normales.",
      treatment: "Continuar con dieta húmeda complementaria para favorecer hidratación.",
      prescription: "Feliway spray ambiental 1 pulverización diaria en transportadora.",
      weightKg: "4.20",
      temperatureC: "38.2",
      internalNotes: "Próximo control sugerido en 6 meses.",
    },
  ]);

  // 8. Registro de Vacunas y Desparasitaciones
  const nextVaccineMilo = new Date();
  nextVaccineMilo.setMonth(nextVaccineMilo.getMonth() + 1);

  const nextDewormLuna = new Date();
  nextDewormLuna.setDate(nextDewormLuna.getDate() + 14);

  const expiredVaccineSimba = new Date();
  expiredVaccineSimba.setMonth(expiredVaccineSimba.getMonth() - 2);

  await db.insert(vaccines).values([
    {
      petId: petMilo.id,
      name: "Antirrábica Canina Anual",
      type: "vaccine",
      dose: "Dosis Anual 2026",
      batchNumber: "RAB-2025-99A",
      appliedAt: new Date(2025, 8, 15),
      nextDueDate: nextVaccineMilo,
      status: "applied",
      vetNotes: "Sin reacciones adversas inmediatas.",
    },
    {
      petId: petLuna.id,
      name: "Antiparasitario Interno Amplio Espectro",
      type: "deworming",
      dose: "1 comprimido palatables",
      batchNumber: "DESP-2026-X4",
      appliedAt: null,
      nextDueDate: nextDewormLuna,
      status: "pending",
      vetNotes: "Programado para próxima consulta de vacunación.",
    },
    {
      petId: petSimba.id,
      name: "Triple Felina (Rinotraqueítis, Calicivirus, Panleucopenia)",
      type: "vaccine",
      dose: "Refuerzo",
      batchNumber: "TF-2024-88",
      appliedAt: new Date(2024, 7, 10),
      nextDueDate: expiredVaccineSimba,
      status: "expired",
      vetNotes: "Dosis vencida hace 2 meses. Requiere aplicación urgente.",
    },
  ]);

  console.log("✅ Datos de prueba sembrados exitosamente en Neon PostgreSQL.");
  return { success: true, countPets: insertedPets.length, countAppointments: insertedAppointments.length };
}
