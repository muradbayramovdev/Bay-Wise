import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import NewTransactionClient from "./NewTransactionClient";

export default async function NewTransactionPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <AppShell>
      <NewTransactionClient />
    </AppShell>
  );
}
