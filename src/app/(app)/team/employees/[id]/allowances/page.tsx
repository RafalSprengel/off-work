import {
  Group,
  Paper,
  Progress,
  Stack,
  Table,
  TableTbody,
  TableTd,
  TableTh,
  TableThead,
  TableTr,
  Text,
} from "@mantine/core";
import { notFound } from "next/navigation";

import { getEmployeeById } from "@/actions/manager/employees/getEmployeeById";
import { getEmployeeLeaveRequests } from "@/actions/manager/leave/getEmployeeLeaveRequests";

// Leave types displayed as rows. Only "Annual" has a configured allowance; the
// remaining categories do not have allowance data in the system yet.
const leaveTypeRows = [
  { label: "Annual allowance" },
  { label: "Unpaid leave" },
  { label: "Sick" },
  { label: "Maternity" },
  { label: "Paternity" },
  { label: "BEREAVEMENT" },
];

export default async function EmployeeAllowancesPage({
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
  const leaveRequests = leavesSuccess ? data : [];

  // Only approved annual leave counts as used allowance so far.
  const usedDays = leaveRequests
    .filter((req) => req.status === "approved" && req.type === "annual")
    .reduce((sum, req) => sum + req.daysRequested, 0);

  const allowance = employee.holidayAllowance;
  const remaining = Math.max(allowance - usedDays, 0);
  const progressValue = allowance > 0 ? (usedDays / allowance) * 100 : 0;

  return (
    <Stack gap="md">
      <Paper withBorder radius="md">
        <Table>
          <TableThead>
            <TableTr>
              <TableTh>Leave type</TableTh>
              <TableTh>Annual allowance</TableTh>
              <TableTh>Days used</TableTh>
              <TableTh>Days remaining</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            <TableTr>
              <TableTd>{leaveTypeRows[0].label}</TableTd>
              <TableTd>{allowance} days</TableTd>
              <TableTd>{usedDays} days</TableTd>
              <TableTd>{remaining} days</TableTd>
            </TableTr>
            {leaveTypeRows.slice(1).map((row) => (
              <TableTr key={row.label}>
                <TableTd>{row.label}</TableTd>
                <TableTd>—</TableTd>
                <TableTd>—</TableTd>
                <TableTd>—</TableTd>
              </TableTr>
            ))}
          </TableTbody>
        </Table>
      </Paper>

      <Paper withBorder radius="md" p="md">
        <Group justify="space-between" mb="xs">
          <Text fw={600} size="sm">
            Holiday allowance usage
          </Text>
          <Text size="xs" c="dimmed">
            {usedDays} / {allowance} days used
          </Text>
        </Group>
        <Progress
          value={Math.min(progressValue, 100)}
          size="lg"
          color={progressValue >= 100 ? "red" : "blue"}
        />
      </Paper>
    </Stack>
  );
}
