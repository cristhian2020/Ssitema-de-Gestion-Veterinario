import { seedDatabase } from "../db/seed-data";

async function main() {
  try {
    await seedDatabase();
    process.exit(0);
  } catch (error) {
    console.error("Error executing seed:", error);
    process.exit(1);
  }
}

main();
