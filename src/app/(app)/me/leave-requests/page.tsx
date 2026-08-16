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
    Textarea,
    Title,
} from "@mantine/core";
import { IconPlus } from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";
import { LeaveRequest } from "@/types/leaveRequest";
import { useRouter } from "next/navigation";

export default function EmployeeLeaveRequestsPage() {
    const router = useRouter();
    const [requests] = useState<LeaveRequest[]>([
        {
            id: "1",
            type: "Annual Leave",
            startDate: "2026-08-20",
            endDate: "2026-08-27",
            days: 6,
            status: "Approved",
            reason: "Summer vacation",
        },
        {
            id: "2",
            type: "Sick Leave",
            startDate: "2026-09-01",
            endDate: "2026-09-02",
            days: 2,
            status: "Pending",
            reason: "Doctor appointment",
        },
    ]);

    const getStatusBadge = (status: LeaveRequest["status"]) => {
        switch (status) {
            case "Approved":
                return <Badge color="green">Approved</Badge>;
            case "Pending":
                return <Badge color="yellow">Pending</Badge>;
            case "Rejected":
                return <Badge color="red">Rejected</Badge>;
            default:
                return <Badge color="gray">{status}</Badge>;
        }
    };

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
                <Title order={4} mb="md">
                    Request History
                </Title>
                <Table highlightOnHover verticalSpacing="sm">
                    <Table.Thead>
                        <Table.Tr>
                            <Table.Th>Type</Table.Th>
                            <Table.Th>Dates</Table.Th>
                            <Table.Th>Days</Table.Th>
                            <Table.Th>Status</Table.Th>
                            <Table.Th>Reason</Table.Th>
                        </Table.Tr>
                    </Table.Thead>
                    <Table.Tbody>
                        {requests.map((item) => (
                            <Table.Tr key={item.id} onClick={() => router.push(`/me/leave-requests/${item.id}`)}
                                style={{ cursor: "pointer" }}>
                                <Table.Td>{item.type}</Table.Td>
                                <Table.Td>
                                    {item.startDate} - {item.endDate}
                                </Table.Td>
                                <Table.Td>{item.days}</Table.Td>
                                <Table.Td>{getStatusBadge(item.status)}</Table.Td>
                                <Table.Td>
                                    <Text size="sm" c="dimmed">
                                        {item.reason}
                                    </Text>
                                </Table.Td>
                            </Table.Tr>
                        ))}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    );
}