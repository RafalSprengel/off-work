"use client";

import {
    Badge,
    Button,
    Grid,
    Group,
    Paper,
    Select,
    Stack,
    Table,
    Text,
    Textarea,
    Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { IconPlus } from "@tabler/icons-react";
import { useState } from "react";

interface LeaveRequest {
    id: string;
    type: string;
    startDate: string;
    endDate: string;
    days: number;
    status: "Pending" | "Approved" | "Rejected";
    reason: string;
}

export default function EmployeeLeaveRequestsPage() {
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
            <Title order={2}>My Leave Requests</Title>

            <Grid gutter="md">
                <Grid.Col span={{ base: 12, md: 4 }}>
                    <Paper p="md" radius="md" withBorder bg="var(--mantine-color-body)">
                        <Title order={4} mb="md">
                            Submit New Request
                        </Title>
                        <form
                            onSubmit={(e) => {
                                e.preventDefault();
                            }}
                        >
                            <Stack gap="sm">
                                <Select
                                    label="Leave Type"
                                    placeholder="Select type"
                                    data={["Annual Leave", "Sick Leave", "Unpaid Leave"]}
                                    required
                                />
                                <Group grow>
                                    <DateInput
                                        label="Start Date"
                                        placeholder="Pick date"
                                        required
                                    />
                                    <DateInput
                                        label="End Date"
                                        placeholder="Pick date"
                                        required
                                    />
                                </Group>
                                <Textarea
                                    label="Reason"
                                    placeholder="Provide additional details..."
                                    minRows={3}
                                />
                                <Button type="submit" leftSection={<IconPlus size={16} />}>
                                    Submit Request
                                </Button>
                            </Stack>
                        </form>
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: 8 }}>
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
                                    <Table.Tr key={item.id}>
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
                </Grid.Col>
            </Grid>
        </Stack>
    );
}