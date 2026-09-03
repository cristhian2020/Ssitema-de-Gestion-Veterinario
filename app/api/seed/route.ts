import { NextResponse } from "next/server";
import { seedDatabase } from "@/db/seed-data";

export async function GET() {
  try {
    const result = await seedDatabase();
    return NextResponse.json({
      message: "Base de datos inicializada correctamente con datos de Huellitas Felices",
      result,
    });
  } catch (error: any) {
    console.error("Error seeding database:", error);
    return NextResponse.json(
      { error: "Error al inicializar la base de datos", details: error.message },
      { status: 500 }
    );
  }
}
