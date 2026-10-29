import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const defaultCategories = [
  // Gelir kategorileri
  { name: "Maaş", icon: "💼", color: "#22c55e", type: "INCOME" as const },
  { name: "Freelance", icon: "💻", color: "#10b981", type: "INCOME" as const },
  { name: "Yatırım", icon: "📈", color: "#06b6d4", type: "INCOME" as const },
  { name: "Diğer Gelir", icon: "💰", color: "#84cc16", type: "INCOME" as const },

  // Gider kategorileri
  { name: "Market", icon: "🛒", color: "#f97316", type: "EXPENSE" as const },
  { name: "Kira", icon: "🏠", color: "#ef4444", type: "EXPENSE" as const },
  { name: "Ulaşım", icon: "🚗", color: "#f59e0b", type: "EXPENSE" as const },
  { name: "Yemek", icon: "🍔", color: "#ec4899", type: "EXPENSE" as const },
  { name: "Sağlık", icon: "💊", color: "#14b8a6", type: "EXPENSE" as const },
  { name: "Eğlence", icon: "🎮", color: "#8b5cf6", type: "EXPENSE" as const },
  { name: "Giyim", icon: "👕", color: "#6366f1", type: "EXPENSE" as const },
  { name: "Faturalar", icon: "📄", color: "#64748b", type: "EXPENSE" as const },
  { name: "Eğitim", icon: "📚", color: "#0ea5e9", type: "EXPENSE" as const },
  { name: "Diğer Gider", icon: "💸", color: "#94a3b8", type: "EXPENSE" as const },
];

async function main() {
  console.log("Seed başlatılıyor...");

  for (const cat of defaultCategories) {
    await prisma.category.upsert({
      where: {
        id: `default-${cat.name}`,
      },
      update: {},
      create: {
        id: `default-${cat.name}`,
        ...cat,
        isDefault: true,
        userId: null,
      },
    });
  }

  console.log(`${defaultCategories.length} varsayılan kategori eklendi.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
