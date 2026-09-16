import { Stack, Title } from "@mantine/core";
import { notFound, redirect } from "next/navigation";

import { getEmployeeById } from "@/actions/manager/employees/getEmployeeById";
import { getCurrentEmployeeRole } from "@/actions/shared/getCurrentEmployeeRole";
import EmployeeDetailTabs from "./_components/EmployeeDetailTabs";

export default async function EmployeeDetailLayout({
  params,
  children,
}: {
  params: Promise<{ id: string }>;
  children: React.ReactNode;
}) {
  const { id } = await params;

  const { success, role } = await getCurrentEmployeeRole();
  if (!success || role === "Employee") {
    redirect("/me");
  }

  const { success: found, data: employee } = await getEmployeeById(id);
  if (!found || !employee) {
    notFound();
  }

  return (
    <Stack gap="lg">
      <Title order={2} fw={700}>
        {employee.firstName} {employee.lastName}
      </Title>

      <EmployeeDetailTabs employeeId={id}>{children}</EmployeeDetailTabs>
    </Stack>
  );
}
