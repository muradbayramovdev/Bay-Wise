import { auth } from "@/lib/auth";
import { redirect } from "next/navigation";
import AppShell from "@/components/layout/AppShell";
import ProfileClient from "./ProfileClient";

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  return (
    <AppShell>
      <ProfileClient
        email={session.user.email ?? ""}
        name={session.user.name ?? ""}
      />
    </AppShell>
  );
}
