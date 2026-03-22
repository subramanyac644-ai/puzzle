import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';
dotenv.config();

const DEFAULT_IMAGE = 'https://images.unsplash.com/photo-1534125895742-a169bbf6ddfb?q=80&w=600&auto=format&fit=crop';

async function main() {
  const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
  const adapter = new PrismaPg(pool);
  const prisma = new PrismaClient({ adapter });

  try {
    const brokenPuzzles = await prisma.puzzle.findMany({
      where: { imageUrl: { startsWith: '/uploads/' } }
    });
    
    console.log(`Found ${brokenPuzzles.length} broken puzzles.`);

    for (const puzzle of brokenPuzzles) {
      await prisma.puzzle.update({
        where: { id: puzzle.id },
        data: { imageUrl: DEFAULT_IMAGE }
      });
      console.log(`Updated puzzle ${puzzle.id}`);
    }
    console.log('Done!');
  } catch(e) { console.error(e) }
  finally { await prisma.$disconnect(); await pool.end(); }
}
main();
