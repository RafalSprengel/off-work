"use client";

import {
  ActionIcon,
  Badge,
  Divider,
  Group,
  Paper,
  Table,
  Text,
  Tooltip,
} from "@mantine/core";
import {
  IconSortAscending,
  IconSortDescending,
} from "@tabler/icons-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import dayjs from "dayjs";
import type { TeamLeaveRequestItem } from "@/types/leaveRequest";
import { formatRequestDays } from "@/utils/leaveBalance";

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

export function LeaveRequestsTable({
  requests,
}: {
  requests: TeamLeaveRequestItem[];
}) {
  const router = useRouter();
  const [sortDirection, setSortDirection] = useState<"newest" | "oldest">(
    "newest",
  );

  const sortedRequests = [...requests].sort((a, b) => {
    const delta =
      dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
    return sortDirection === "newest" ? delta : -delta;
  });

  const today = dayjs().startOf("day");
  const isPast = (item: { endDate: string }) =>
    dayjs(item.endDate).startOf("day").isBefore(today);

  const currentRequests = sortedRequests.filter((r) => !isPast(r));
  const pastRequests = sortedRequests.filter((r) => isPast(r));

  return (
    <Paper withBorder radius="md">
      <Group justify="space-between" px="sm" py="xs">
        <Text size="sm" fw={600} c="dimmed">
          Leave requests
        </Text>
        <Tooltip
          label={
            sortDirection === "newest"
              ? "Newest first — click for oldest first"
              : "Oldest first — click for newest first"
          }
        >
          <ActionIcon
            variant={sortDirection === "newest" ? "light" : "subtle"}
            color="blue"
            radius="xl"
            onClick={() =>
              setSortDirection(
                sortDirection === "newest" ? "oldest" : "newest",
              )
            }
          >
            {sortDirection === "newest" ? (
              <IconSortDescending size={16} />
            ) : (
              <IconSortAscending size={16} />
            )}
          </ActionIcon>
        </Tooltip>
      </Group>
      <Table>
        <Table.Thead>
          <Table.Tr>
            <Table.Th>Type</Table.Th>
            <Table.Th>Dates</Table.Th>
            <Table.Th>Days</Table.Th>
            <Table.Th>Status</Table.Th>
          </Table.Tr>
        </Table.Thead>
        <Table.Tbody>
          {currentRequests.length === 0 && pastRequests.length === 0 ? (
            <Table.Tr>
              <Table.Td colSpan={4}>
                <Text size="sm" c="dimmed">
                  No leave requests for this employee yet.
                </Text>
              </Table.Td>
            </Table.Tr>
          ) : (
            <>
              {currentRequests.map((req) => (
                <Table.Tr
                  key={req._id}
                  onClick={() => router.push(`/team/leave-requests/${req._id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <Table.Td>{typeLabels[req.type] ?? req.type}</Table.Td>
                  <Table.Td>
                    <Text size="sm">
                      {dayjs(req.startDate).format("DD-MM-YYYY")} → {dayjs(req.endDate).format("DD-MM-YYYY")}
                    </Text>
                  </Table.Td>
                  <Table.Td>{formatRequestDays(req)}</Table.Td>
                  <Table.Td>
                    <Badge
                      variant="light"
                      color={statusColors[req.status] ?? "gray"}
                    >
                      {statusLabels[req.status] ?? req.status}
                    </Badge>
                  </Table.Td>
                </Table.Tr>
              ))}
              {pastRequests.length > 0 && (
                <>
                  <Table.Tr>
                    <Table.Td colSpan={4}>
                      <Divider label="Past Leaves" labelPosition="left" my="xs" />
                    </Table.Td>
                  </Table.Tr>
                  {pastRequests.map((req) => (
                    <Table.Tr
                      key={req._id}
                      onClick={() => router.push(`/team/leave-requests/${req._id}`)}
                      style={{ cursor: "pointer" }}
                    >
                      <Table.Td>{typeLabels[req.type] ?? req.type}</Table.Td>
                      <Table.Td>
                        <Text size="sm">
                          {dayjs(req.startDate).format("DD-MM-YYYY")} → {dayjs(req.endDate).format("DD-MM-YYYY")}
                        </Text>
                      </Table.Td>
                      <Table.Td>{formatRequestDays(req)}</Table.Td>
                      <Table.Td>
                        <Badge
                          variant="light"
                          color={statusColors[req.status] ?? "gray"}
                        >
                          {statusLabels[req.status] ?? req.status}
                        </Badge>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </>
              )}
            </>
          )}
        </Table.Tbody>
      </Table>
    </Paper>
  );
}
