import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import RecurringClient from "./RecurringClient";

export default async function RecurringPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  return (
    <AppShell>
      <RecurringClient />
    </AppShell>
  );
}
