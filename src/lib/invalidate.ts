import { revalidateTag } from "next/cache";
import { CACHE_TAGS } from "./cache";

export function invalidateSummary(userId: string, month: number, year: number) {
  revalidateTag(CACHE_TAGS.summary(userId, month, year));
}

export function invalidateTrend(userId: string) {
  revalidateTag(CACHE_TAGS.trend(userId));
}

export function invalidateCategories(userId: string) {
  revalidateTag(CACHE_TAGS.categories(userId));
}

// Call after any transaction mutation
export function invalidateTransactionCaches(userId: string, date: Date) {
  const month = date.getMonth() + 1;
  const year = date.getFullYear();
  invalidateSummary(userId, month, year);
  invalidateTrend(userId);
}
