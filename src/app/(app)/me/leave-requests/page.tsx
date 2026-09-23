"use client";

import {
    ActionIcon,
    Badge,
    Box,
    Button,
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
import dayjs from "dayjs";
import { useState } from "react";

const typeLabels: Record<string, string> = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    unpaid: "Unpaid Leave",
    other: "Other",
};

export default function EmployeeLeaveRequestsPage() {
    const router = useRouter();
    const { requests } = useMyLeaveRequests();
    const [statusFilter, setStatusFilter] = useState<string>("All");
    const [sortDirection, setSortDirection] = useState<"newest" | "oldest">("newest");

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

    const displayRequests = [...filteredRequests].sort((a, b) => {
        const delta =
            dayjs(b.createdAt).valueOf() - dayjs(a.createdAt).valueOf();
        return sortDirection === "newest" ? delta : -delta;
    });

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
                </Group>
                <Box visibleFrom="sm">
                    <Table highlightOnHover verticalSpacing="sm">
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Type</Table.Th>
                                <Table.Th>Dates</Table.Th>
                                <Table.Th>Days</Table.Th>
                                <Table.Th>Status</Table.Th>
                                <Table.Th>Comment</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {displayRequests.map((item) => (
                                <Table.Tr key={item._id} onClick={() => router.push(`/me/leave-requests/${item._id}`)}
                                    style={{ cursor: "pointer" }}>
                                    <Table.Td>{typeLabels[item.type] ?? item.type}</Table.Td>
                                    <Table.Td>
                                        {dayjs(item.startDate).format("DD-MM-YYYY")} → {dayjs(item.endDate).format("DD-MM-YYYY")}
                                    </Table.Td>
                                    <Table.Td>{item.daysRequested}</Table.Td>
                                    <Table.Td>{getStatusBadge(item.status)}</Table.Td>
                                    <Table.Td>
                                        <Text size="sm" c="dimmed" lineClamp={1}>
                                            {item.comment || "—"}
                                        </Text>
                                    </Table.Td>
                                </Table.Tr>
                            ))}
                            {filteredRequests.length === 0 && (
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
                    {filteredRequests.length === 0 && (
                        <Text size="sm" c="dimmed" ta="center">
                            No leave requests found.
                        </Text>
                    )}
                    {displayRequests.map((item) => (
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
                                <Text size="sm">{item.daysRequested}</Text>
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
                </Stack>
            </Paper>
        </Stack>
    );
}