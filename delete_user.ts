import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const users = await prisma.user.findMany();
  console.log('All users:', users.map(u => ({ id: u.id, username: u.username, role: u.role })));
  
  const userToDelete = users.find(u => u.username === 'admin123adminuser');
  if (userToDelete) {
    // Delete related puzzles first (to avoid FK constraints if any, though usually cascade or manual)
    // Actually our schema doesn't have FK for uploadedBy to User in a strict way that prevents deletion usually, 
    // but Prisma might. Let's check schema.
    await prisma.user.delete({ where: { id: userToDelete.id } });
    console.log(`Deleted user: ${userToDelete.username}`);
  } else {
    console.log('User admin123adminuser not found.');
  }
}

main().finally(() => pool.end());
