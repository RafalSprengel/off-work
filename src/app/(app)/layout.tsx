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

  // Read the current pathname from the headers to decide how to render.
  const headersList = await headers();
  const pathname = headersList.get("x-invoke-path") || headersList.get("next-url") || "";
  const isOnboarding = pathname.includes("/onboarding");

  if (isOnboarding) {
    // Onboarding is for users who just verified their email and don't
    // have an organization yet — just pass children through without
    // the app shell (no org/employee data to drive it).
    return <>{children}</>;
  }

  if (!session.session.activeOrganizationId) {
    redirect("/sign-in");
  }

  const { success, role } = await getCurrentEmployeeRole({ freshSession: true });

  // No valid Employee profile or account is deactivated — block access
  if (!success) {
    redirect("/sign-in");
  }

  return <AppShellClient role={role}>{children}</AppShellClient>;
}