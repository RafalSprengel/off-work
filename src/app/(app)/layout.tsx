import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import AppShellClient from "@/app/(app)/components/AppShellClient/AppShellClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const auth = await getAuth();

  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.session.activeOrganizationId) {
    redirect("/sign-in");
  }

  return <AppShellClient>{children}</AppShellClient>;
}