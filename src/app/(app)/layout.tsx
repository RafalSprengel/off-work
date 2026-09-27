import { redirect } from "next/navigation";
import { getCachedSession } from "@/lib/session";
import { getCurrentEmployeeRole } from "@/actions/shared/getCurrentEmployeeRole";
import AppShellClient from "@/app/(app)/components/AppShellClient/AppShellClient";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getCachedSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  if (!session.session.activeOrganizationId) {
    return <>{children}</>;
  }

  const { success, role } = await getCurrentEmployeeRole({
    preloadedSession: session,
  });

  if (!success) {
    redirect("/sign-in");
  }

  return <AppShellClient role={role}>{children}</AppShellClient>;
}