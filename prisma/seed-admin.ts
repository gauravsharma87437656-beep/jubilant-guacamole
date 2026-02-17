import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Check if admin user already exists
  const existingAdmin = await prisma.user.findUnique({
    where: { email: "moonmoonsb27@gmail.com" },
  });

  if (existingAdmin) {
    console.log("Admin user already exists");
    
    // Update role to ADMIN if not already
    if (existingAdmin.role !== "ADMIN") {
      await prisma.user.update({
        where: { email: "moonmoonsb27@gmail.com" },
        data: { role: "ADMIN" },
      });
      console.log("Updated user role to ADMIN");
    }
    return;
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash("Test@123", 12);

  // Create admin user
  const admin = await prisma.user.create({
    data: {
      name: "Admin",
      email: "moonmoonsb27@gmail.com",
      password: hashedPassword,
      role: "ADMIN",
    },
  });

  console.log("Admin user created:", admin.email);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
