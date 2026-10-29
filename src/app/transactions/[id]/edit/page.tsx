import { auth } from "@/lib/auth";
import { redirect, notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import AppShell from "@/components/layout/AppShell";
import EditTransactionClient from "./EditTransactionClient";

export default async function EditTransactionPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/auth/login");

  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    include: { category: true },
  });

  if (!transaction || transaction.userId !== session.user.id) notFound();

  return (
    <AppShell>
      <EditTransactionClient transaction={JSON.parse(JSON.stringify(transaction))} />
    </AppShell>
  );
}
