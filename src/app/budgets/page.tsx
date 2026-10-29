import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import BudgetsClient from "./BudgetsClient";

export default async function BudgetsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  return (
    <AppShell>
      <BudgetsClient />
    </AppShell>
  );
}
