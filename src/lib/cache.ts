import { unstable_cache } from "next/cache";
import { prisma } from "./prisma";

// Cache tags — used to invalidate on mutation
export const CACHE_TAGS = {
  summary: (userId: string, month: number, year: number) =>
    `summary-${userId}-${month}-${year}`,
  trend: (userId: string) => `trend-${userId}`,
  categories: (userId: string) => `categories-${userId}`,
};

export function getCachedSummary(userId: string, month: number, year: number) {
  return unstable_cache(
    async () => {
      const start = new Date(year, month - 1, 1);
      const end = new Date(year, month, 0, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: end } },
        include: { category: true },
      });

      const totalIncome = transactions
        .filter((t) => t.type === "INCOME")
        .reduce((s, t) => s + t.amount, 0);

      const totalExpense = transactions
        .filter((t) => t.type === "EXPENSE")
        .reduce((s, t) => s + t.amount, 0);

      const expenseByCategory: Record<string, { name: string; color: string; icon: string; total: number }> = {};
      transactions
        .filter((t) => t.type === "EXPENSE")
        .forEach((t) => {
          const key = t.category.id;
          if (!expenseByCategory[key]) {
            expenseByCategory[key] = { name: t.category.name, color: t.category.color, icon: t.category.icon, total: 0 };
          }
          expenseByCategory[key].total += t.amount;
        });

      return {
        totalIncome,
        totalExpense,
        net: totalIncome - totalExpense,
        month,
        year,
        expenseByCategory: Object.values(expenseByCategory).sort((a, b) => b.total - a.total),
      };
    },
    [CACHE_TAGS.summary(userId, month, year)],
    { revalidate: 300, tags: [CACHE_TAGS.summary(userId, month, year)] }
  )();
}

export function getCachedTrend(userId: string) {
  return unstable_cache(
    async () => {
      const now = new Date();
      const months: { year: number; month: number; label: string }[] = [];

      for (let i = 5; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        months.push({
          year: d.getFullYear(),
          month: d.getMonth() + 1,
          label: d.toLocaleDateString("tr-TR", { month: "short", year: "2-digit" }),
        });
      }

      const start = new Date(months[0].year, months[0].month - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

      const transactions = await prisma.transaction.findMany({
        where: { userId, date: { gte: start, lte: end } },
        select: { type: true, amount: true, date: true },
      });

      const map: Record<string, { income: number; expense: number }> = {};
      for (const { year, month } of months) map[`${year}-${month}`] = { income: 0, expense: 0 };

      for (const t of transactions) {
        const d = new Date(t.date);
        const key = `${d.getFullYear()}-${d.getMonth() + 1}`;
        if (!map[key]) continue;
        if (t.type === "INCOME") map[key].income += t.amount;
        else map[key].expense += t.amount;
      }

      return months.map(({ year, month, label }) => ({
        label,
        income: Math.round(map[`${year}-${month}`].income),
        expense: Math.round(map[`${year}-${month}`].expense),
      }));
    },
    [CACHE_TAGS.trend(userId)],
    { revalidate: 300, tags: [CACHE_TAGS.trend(userId)] }
  )();
}

export function getCachedCategories(userId: string) {
  return unstable_cache(
    async () => {
      return prisma.category.findMany({
        where: { OR: [{ isDefault: true }, { userId }] },
        orderBy: [{ isDefault: "desc" }, { name: "asc" }],
      });
    },
    [CACHE_TAGS.categories(userId)],
    { revalidate: 3600, tags: [CACHE_TAGS.categories(userId)] }
  )();
}
