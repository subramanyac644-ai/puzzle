import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admin = await prisma.user.findFirst({ where: { role: 'admin' } });
  if (!admin) {
    console.error('No admin user found');
    return;
  }

  // A 400x400 solid blue PNG base64
  const blue400 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAZAAAAGQAQMAAAC6ca7CAAAAA1BMVEX/AABH9H9HAAAAaklEQVR4Ae3BgQAAAADDoPlTH+dBVQEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwB66gAAW7X69sAAAAASUVORK5CYII=";

  const puzzle = await prisma.puzzle.create({
    data: {
      imageUrl: blue400, 
      level: 'easy',
      uploadedBy: admin.id,
    },
  });

  console.log('Created valid test puzzle:', puzzle.id);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
