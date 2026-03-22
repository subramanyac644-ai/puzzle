import { PrismaClient } from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import pg from 'pg';
import bcrypt from 'bcryptjs';
import * as dotenv from 'dotenv';

dotenv.config();

const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool as any);
const prisma = new PrismaClient({ adapter });

async function main() {
  const admins = await prisma.user.findMany({ where: { role: 'admin' } });
  
  if (admins.length > 0) {
    console.log(`Found ${admins.length} admin(s).`);
    const admin = admins[0];
    const newPassword = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    await prisma.user.update({
      where: { id: admin.id },
      data: { password: hashedPassword }
    });
    console.log(`Updated admin password for '${admin.username}'.`);
    console.log(`Username: ${admin.username}`);
    console.log(`Password: ${newPassword}`);
  } else {
    console.log('No admin users found. Creating one...');
    const newPassword = 'adminpassword123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    
    const newAdmin = await prisma.user.create({
      data: {
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        email: 'admin@example.com'
      }
    });
    console.log(`Created new admin user.`);
    console.log(`Username: ${newAdmin.username}`);
    console.log(`Password: ${newPassword}`);
  }
}

main().catch(console.error).finally(() => prisma.$disconnect());
