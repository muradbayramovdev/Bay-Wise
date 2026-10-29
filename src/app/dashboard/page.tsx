import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import DashboardClient from "./DashboardClient";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <AppShell>
      <DashboardClient userName={session.user.name ?? session.user.email ?? ""} />
    </AppShell>
  );
}
