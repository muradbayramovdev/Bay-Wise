import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import AnalyticsClient from "./AnalyticsClient";

export default async function AnalyticsPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");
  return (
    <AppShell>
      <AnalyticsClient />
    </AppShell>
  );
}
