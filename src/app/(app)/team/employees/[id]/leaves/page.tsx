import {
  Badge,
  Paper,
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

const typeLabels: Record<string, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  unpaid: "Unpaid Leave",
  other: "Other",
};

const statusLabels: Record<string, string> = {
  approved: "Approved",
  rejected: "Rejected",
  pending: "Pending",
  cancelled: "Cancelled",
};

const statusColors: Record<string, string> = {
  approved: "green",
  rejected: "red",
  pending: "yellow",
  cancelled: "gray",
};

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
      <Paper withBorder radius="md">
        <Table>
          <TableThead>
            <TableTr>
              <TableTh>Type</TableTh>
              <TableTh>Dates</TableTh>
              <TableTh>Days</TableTh>
              <TableTh>Status</TableTh>
            </TableTr>
          </TableThead>
          <TableTbody>
            {requests.length === 0 ? (
              <TableTr>
                <TableTd colSpan={4}>
                  <Text size="sm" c="dimmed">
                    No leave requests for this employee yet.
                  </Text>
                </TableTd>
              </TableTr>
            ) : (
              requests.map((req) => (
                <TableTr key={req._id}>
                  <TableTd>{typeLabels[req.type] ?? req.type}</TableTd>
                  <TableTd>
                    <Text size="sm">
                      {req.startDate} → {req.endDate}
                    </Text>
                  </TableTd>
                  <TableTd>{req.daysRequested}</TableTd>
                  <TableTd>
                    <Badge
                      variant="light"
                      color={statusColors[req.status] ?? "gray"}
                    >
                      {statusLabels[req.status] ?? req.status}
                    </Badge>
                  </TableTd>
                </TableTr>
              ))
            )}
          </TableTbody>
        </Table>
      </Paper>
    </Stack>
  );
}
