import { redirect } from "next/navigation";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";
import { getCurrentEmployeeRole } from "@/actions/shared/getCurrentEmployeeRole";
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

  // If the user has no active organization yet (e.g. just verified email
  // and hasn't completed onboarding), render without the app shell.
  if (!session.session.activeOrganizationId) {
    return <>{children}</>;
  }

  const { success, role } = await getCurrentEmployeeRole({ freshSession: true });

  // No valid Employee profile or account is deactivated — block access
  if (!success) {
    redirect("/sign-in");
  }

  return <AppShellClient role={role}>{children}</AppShellClient>;
}