import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const email = "muradbayramov251@gmail.com";
  const user = await prisma.user.update({
    where: { email },
    data: { role: "ADMIN" },
  });
  console.log("Admin yapıldı:", user.email, "| Rol:", user.role);
}

main()
  .catch((e) => console.error("HATA:", e.message))
  .finally(() => prisma.$disconnect());
