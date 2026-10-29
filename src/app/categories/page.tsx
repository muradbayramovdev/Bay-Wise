import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import CategoriesClient from "./CategoriesClient";

export default async function CategoriesPage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <AppShell>
      <CategoriesClient />
    </AppShell>
  );
}
