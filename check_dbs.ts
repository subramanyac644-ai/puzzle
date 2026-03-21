import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

async function checkDb(url: string, name: string) {
  console.log(`Checking ${name}...`);
  const pool = new pg.Pool({ connectionString: url });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });
  try {
    const count = await prisma.user.count();
    console.log(`${name} User count: ${count}`);
    if (count > 0) {
      const users = await prisma.user.findMany();
      console.table(users.map(u => ({ id: u.id, username: u.username, role: u.role })));
    }
  } catch (e: any) {
    console.log(`${name} error: ${e.message}`);
  } finally {
    await prisma.$disconnect();
    await pool.end();
  }
}

async function main() {
  await checkDb(process.env.DATABASE_URL!, 'puzzle');
  const pollingUrl = 'postgresql://postgres:2Ss8050@localhost:5432/polling_db?sslmode=disable';
  await checkDb(pollingUrl, 'polling_db');
}

main();
