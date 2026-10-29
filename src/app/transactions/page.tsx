import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import TransactionsClient from "./TransactionsClient";

export default async function TransactionsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <AppShell>
      <TransactionsClient />
    </AppShell>
  );
}
