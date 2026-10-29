export function validateAmount(amount: unknown): number | null {
  const n = Number(amount);
  if (isNaN(n) || n <= 0 || n > 999_999_999) return null;
  return Math.round(n * 100) / 100; // max 2 decimal places
}

export function validateString(value: unknown, maxLength = 255): string | null {
  if (typeof value !== "string") return null;
  const trimmed = value.trim();
  if (trimmed.length === 0 || trimmed.length > maxLength) return null;
  return trimmed;
}

export function validateOptionalString(value: unknown, maxLength = 255): string | null {
  if (value === undefined || value === null || value === "") return null;
  if (typeof value !== "string") return null;
  return value.trim().slice(0, maxLength) || null;
}

export function validateTransactionType(type: unknown): "INCOME" | "EXPENSE" | null {
  if (type === "INCOME" || type === "EXPENSE") return type;
  return null;
}

export function validateCategoryType(type: unknown): "INCOME" | "EXPENSE" | null {
  if (type === "INCOME" || type === "EXPENSE") return type;
  return null;
}

export function validateMonth(month: unknown): number | null {
  const n = Number(month);
  if (isNaN(n) || n < 1 || n > 12) return null;
  return n;
}

export function validateYear(year: unknown): number | null {
  const n = Number(year);
  if (isNaN(n) || n < 2000 || n > 2100) return null;
  return n;
}
