"use client";

import {
    ActionIcon,
    Badge,
    Box,
    Button,
    Divider,
    Group,
    Paper,
    Select,
    Stack,
    Table,
    Text,
    Title,
    Tooltip,
} from "@mantine/core";
import {
    IconPlus,
    IconSortAscending,
    IconSortDescending,
} from "@tabler/icons-react";
import Link from "next/link";
import { useMyLeaveRequests } from "@/hooks/useMyLeaveRequests";
import { useRouter } from "next/navigation";
import { formatRequestDays } from "@/utils/leaveBalance";
import { LEAVE_REQUEST_TYPES, getLeaveTypeLabel } from "@/constants/leaveTypes";
import dayjs from "dayjs";
import { useState } from "react";
import SortableHeader from "@/app/(app)/components/SortableHeader/SortableHeader";
import { sortItems, type SortDirection } from "@/utils/sort";

const typeLabels: Record<string, string> = Object.fromEntries(
    LEAVE_REQUEST_TYPES.map((t) => [t, getLeaveTypeLabel(t)]),
);

type SortColumn = "type" | "dates" | "days" | "status" | "comment";

export default function EmployeeLeaveRequestsPage() {
    const router = useRouter();
    const { requests } = useMyLeaveRequests();
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortDirection, setSortDirection] = useState<"newest" | "oldest">("newest");
    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [columnDirection, setColumnDirection] = useState<SortDirection>("asc");

    function handleSort(column: SortColumn) {
        if (sortColumn === column) {
            setColumnDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortColumn(column);
            setColumnDirection("asc");
        }
    }

    const getStatusBadge = (status: string) => {
        switch (status) {
            case "approved":
                return <Badge color="green">Approved</Badge>;
            case "pending":
                return <Badge color="yellow">Pending</Badge>;
            case "rejected":
                return <Badge color="red">Rejected</Badge>;
            case "cancelled":
                return <Badge color="gray">Cancelled</Badge>;
            default:
                return <Badge color="gray">{status}</Badge>;
        }
    };

    const filteredRequests =
        statusFilter === "All"
            ? requests
            : requests.filter((r) => r.status === statusFilter.toLowerCase());

    const displayRequests = sortColumn
        ? sortItems(
              filteredRequests,
              (req) => {
                  switch (sortColumn) {
                      case "type":
                          return typeLabels[req.type] ?? req.type;
                      case "dates":
                          return dayjs(req.startDate).valueOf();
                      case "days":
                          return req.daysRequested;
                      case "status":
                          return req.status;
                      case "comment":
                          return req.comment ?? "";
                  }
              },
              columnDirection,
          )
        : [...filteredRequests].sort((a, b) => {
              const delta =
                  dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
              return sortDirection === "newest" ? delta : -delta;
          });

    const today = dayjs().startOf("day");
    const isPast = (item: { endDate: string }) =>
        dayjs(item.endDate).startOf("day").isBefore(today);

    const currentRequests = displayRequests.filter((r) => !isPast(r));
    const pastRequests = displayRequests.filter((r) => isPast(r));

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="center">
                <Title order={2}>My Leave Requests</Title>
                <Button leftSection={<IconPlus size={18} />} component={Link} href="/me/leave-requests/new">
                    New Request
                </Button>
            </Group>

            <Paper
                p="md"
                radius="md"
                withBorder
                bg="var(--mantine-color-body)"
                style={{ overflowX: "auto" }}
            >
                <Group justify="space-between" mb="md">
                    <Title order={4}>Request History</Title>
                    <Group gap="xs">
                        <Select
                            value={statusFilter}
                            onChange={(val) => setStatusFilter(val ?? "All")}
                            data={["All", "Pending", "Approved", "Rejected", "Cancelled"]}
                            w={160}
                        />
                        <Tooltip
                            label={
                                sortDirection === "newest"
                                    ? "Newest first — click for oldest first"
                                    : "Oldest first — click for newest first"
                            }
                        >
                            <ActionIcon
                                variant={
                                    sortDirection === "newest" ? "light" : "subtle"
                                }
                                color="blue"
                                radius="xl"
                                onClick={() => {
                                    setSortColumn(null);
                                    setSortDirection(
                                        sortDirection === "newest" ? "oldest" : "newest",
                                    );
                                }}
                            >
                                {sortDirection === "newest" ? (
                                    <IconSortDescending size={16} />
                                ) : (
                                    <IconSortAscending size={16} />
                                )}
                            </ActionIcon>
                        </Tooltip>
                    </Group>
                </Group>
                <Box visibleFrom="sm">
                    <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>
                                    <SortableHeader label="Type" active={sortColumn === "type"} direction={columnDirection} onSort={() => handleSort("type")} />
                                </Table.Th>
                                <Table.Th>
                                    <SortableHeader label="Dates" active={sortColumn === "dates"} direction={columnDirection} onSort={() => handleSort("dates")} />
                                </Table.Th>
                                <Table.Th>
                                    <SortableHeader label="Days" active={sortColumn === "days"} direction={columnDirection} onSort={() => handleSort("days")} />
                                </Table.Th>
                                <Table.Th>
                                    <SortableHeader label="Status" active={sortColumn === "status"} direction={columnDirection} onSort={() => handleSort("status")} />
                                </Table.Th>
                                <Table.Th>
                                    <SortableHeader label="Comment" active={sortColumn === "comment"} direction={columnDirection} onSort={() => handleSort("comment")} />
                                </Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {currentRequests.map((item) => (
                                <Table.Tr key={item._id} onClick={() => router.push(`/me/leave-requests/${item._id}`)}
                                    style={{ cursor: "pointer" }}>
                                    <Table.Td>{typeLabels[item.type] ?? item.type}</Table.Td>
                                    <Table.Td>
                                        {dayjs(item.startDate).format("DD-MM-YYYY")} → {dayjs(item.endDate).format("DD-MM-YYYY")}
                                    </Table.Td>
                                    <Table.Td>{formatRequestDays(item)}</Table.Td>
                                    <Table.Td>{getStatusBadge(item.status)}</Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed" lineClamp={1}>
                                            {item.comment || "—"}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                            {pastRequests.length > 0 && (
                                <>
                                    <Table.Tr>
                                        <Table.Td colSpan={5}>
                                            <Divider label="Past Leaves" labelPosition="center" my="xs" />
                                        </Table.Td>
                                    </Table.Tr>
                                    {pastRequests.map((item) => (
                                        <Table.Tr key={item._id} onClick={() => router.push(`/me/leave-requests/${item._id}`)}
                                            style={{ cursor: "pointer" }}>
                                            <Table.Td>{typeLabels[item.type] ?? item.type}</Table.Td>
                                            <Table.Td>
                                                {dayjs(item.startDate).format("DD-MM-YYYY")} → {dayjs(item.endDate).format("DD-MM-YYYY")}
                                            </Table.Td>
                                            <Table.Td>{formatRequestDays(item)}</Table.Td>
                                            <Table.Td>{getStatusBadge(item.status)}</Table.Td>
                                            <Table.Td>
                                                <Text size="sm" c="dimmed" lineClamp={1}>
                                                    {item.comment || "—"}
                                                </Text>
                                            </Table.Td>
                                        </Table.Tr>
                                    ))}
                                </>
                            )}
                            {displayRequests.length === 0 && (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>
                                        <Text size="sm" c="dimmed" ta="center">
                                            No leave requests found.
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Box>

                <Stack gap="md" hiddenFrom="sm">
                    {currentRequests.length === 0 && pastRequests.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center">
                            No leave requests found.
                        </Text>
                    )}
                    {currentRequests.map((item) => (
                        <Paper
                            key={item._id}
                            p="sm"
                            radius="md"
                            withBorder
                            onClick={() => router.push(`/me/leave-requests/${item._id}`)}
                            style={{ cursor: "pointer" }}
                        >
                            <Group justify="space-between" align="center" mb="xs">
                                <Text fw={600} size="md">
                                    {typeLabels[item.type] ?? item.type}
                                </Text>
                                {getStatusBadge(item.status)}
                            </Group>
                            <Group justify="space-between" gap="xs">
                                <Text size="sm" c="dimmed" flex="0 0 auto">
                                    Dates
                                </Text>
                                <Text size="sm">
                                    {dayjs(item.startDate).format("DD-MM-YYYY")} → {dayjs(item.endDate).format("DD-MM-YYYY")}
                                </Text>
                            </Group>
                            <Group justify="space-between" gap="xs">
                                <Text size="sm" c="dimmed" flex="0 0 auto">
                                    Days
                                </Text>
                                <Text size="sm">{formatRequestDays(item)}</Text>
                            </Group>
                            {item.comment && (
                                <Group justify="space-between" gap="xs">
                                    <Text size="sm" c="dimmed" flex="0 0 auto">
                                        Comment
                                    </Text>
                                    <Text size="sm" lineClamp={2}>
                                        {item.comment}
                                    </Text>
                                </Group>
                            )}
                        </Paper>
                    ))}
                    {pastRequests.length > 0 && (
                        <>
                            <Divider label="Past Leaves" labelPosition="center" color="gray.3" />
                            {pastRequests.map((item) => (
                                <Paper
                                    key={item._id}
                                    p="sm"
                                    radius="md"
                                    withBorder
                                    onClick={() => router.push(`/me/leave-requests/${item._id}`)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <Group justify="space-between" align="center" mb="xs">
                                        <Text fw={600} size="md">
                                            {typeLabels[item.type] ?? item.type}
                                        </Text>
                                        {getStatusBadge(item.status)}
                                    </Group>
                                    <Group justify="space-between" gap="xs">
                                        <Text size="sm" c="dimmed" flex="0 0 auto">
                                            Dates
                                        </Text>
                                        <Text size="sm">
                                            {dayjs(item.startDate).format("DD-MM-YYYY")} → {dayjs(item.endDate).format("DD-MM-YYYY")}
                                        </Text>
                                    </Group>
                                    <Group justify="space-between" gap="xs">
                                        <Text size="sm" c="dimmed" flex="0 0 auto">
                                            Days
                                        </Text>
                                        <Text size="sm">{formatRequestDays(item)}</Text>
                                    </Group>
                                    {item.comment && (
                                        <Group justify="space-between" gap="xs">
                                            <Text size="sm" c="dimmed" flex="0 0 auto">
                                                Comment
                                            </Text>
                                            <Text size="sm" lineClamp={2}>
                                                {item.comment}
                                            </Text>
                                        </Group>
                                    )}
                                </Paper>
                            ))}
                        </>
                    )}
                </Stack>
            </Paper>
        </Stack>
    );
}