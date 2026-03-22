import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
import fs from 'fs';

dotenv.config();

// Create a small 1x1 red pixel Base64
const dummyBase64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8z8BQDwAEhQGAhKmMIQAAAABJRU5ErkJggg==";

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    // 1. Get an admin user
    let user = await prisma.user.findFirst({ where: { role: 'admin' } });
    if (!user) user = await prisma.user.findFirst();
    if (!user) throw new Error("No users found");

    // 2. Upload test puzzle
    const puzzle = await prisma.puzzle.create({
      data: {
        imageUrl: dummyBase64,
        level: 'easy',
        uploadedBy: user.id
      }
    });
    console.log(`Uploaded test puzzle: ${puzzle.id}`);
    
    // 3. Verify it was saved correctly
    const saved = await prisma.puzzle.findUnique({ where: { id: puzzle.id } });
    console.log("Saved URL matches exactly? ", saved?.imageUrl === dummyBase64);
    
  } catch(e) { console.error(e) }
  finally { await prisma.$disconnect(); await pool.end(); }
}
main();
