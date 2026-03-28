import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  const username = 'ss';
  try {
    const user = await prisma.user.update({
      where: { username },
      data: { role: 'admin' }
    });
    console.log(`Successfully promoted ${username} to admin!`);
  } catch (err) {
    console.error(`Error promoting ${username}:`, err);
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
