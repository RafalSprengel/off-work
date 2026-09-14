"use client";

import {
    Badge,
    Button,
    Group,
    Paper,
    Select,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
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
                    <Select
                        value={statusFilter}
                        onChange={(val) => setStatusFilter(val ?? "All")}
                        data={["All", "Pending", "Approved", "Rejected", "Cancelled"]}
                        w={160}
                    />
                </Group>
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
                        {filteredRequests.map((item) => (
                            <Table.Tr key={item._id} onClick={() => router.push(`/me/leave-requests/${item._id}`)}
                                style={{ cursor: "pointer" }}>
                                <Table.Td>{typeLabels[item.type] ?? item.type}</Table.Td>
                                <Table.Td>
                                    {dayjs(item.startDate).format("YYYY-MM-DD")} - {dayjs(item.endDate).format("YYYY-MM-DD")}
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
            </Paper>
        </Stack>
    );
}