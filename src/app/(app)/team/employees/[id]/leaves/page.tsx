import { Stack } from "@mantine/core";
import { notFound } from "next/navigation";

import { getEmployeeById } from "@/actions/manager/employees/getEmployeeById";
import { getEmployeeLeaveRequests } from "@/actions/manager/leave/getEmployeeLeaveRequests";

import { LeaveRequestsTable } from "./_components/LeaveRequestsTable";

export default async function EmployeeLeavesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { success, data: employee } = await getEmployeeById(id);
  if (!success || !employee) {
    notFound();
  }

  const { success: leavesSuccess, data } = await getEmployeeLeaveRequests(id);
  const requests = leavesSuccess ? data : [];

  return (
    <Stack gap="md">
      <LeaveRequestsTable requests={requests} />
    </Stack>
  );
}
