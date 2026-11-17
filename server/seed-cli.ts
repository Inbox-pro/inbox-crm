import { connectDatabase, closeDatabase } from './db/connection';
import { seedDatabase } from './db/seed';

async function main() {
  console.log('🔄 Connecting to MongoDB for seeding...');
  const connected = await connectDatabase();
  if (!connected) {
    console.error('❌ Cannot run seed script: MongoDB is not reachable. Check MONGODB_URI.');
    process.exit(1);
  }

  const force = process.argv.includes('--force') || process.argv.includes('-f');
  console.log(`🌱 Seeding database (force: ${force})...`);
  await seedDatabase(force);
  await closeDatabase();
  console.log('✨ Seed CLI execution finished.');
  process.exit(0);
}

main();

