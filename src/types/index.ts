export type TransactionType = "INCOME" | "EXPENSE";
export type CategoryType = "INCOME" | "EXPENSE";

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  type: CategoryType;
  isDefault: boolean;
  userId: string | null;
}

export interface Transaction {
  id: string;
  amount: number;
  type: TransactionType;
  note: string | null;
  date: string;
  userId: string;
  categoryId: string;
  category: Category;
  createdAt: string;
}

export interface MonthlySummary {
  totalIncome: number;
  totalExpense: number;
  net: number;
  month: number;
  year: number;
}
