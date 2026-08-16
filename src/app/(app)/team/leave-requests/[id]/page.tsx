"use client";

import {
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Divider,
    Flex,
    Group,
    Loader,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import {
    IconArrowLeft,
    IconBriefcase,
    IconCalendarEvent,
    IconMail,
    IconMessage,
    IconUser,
    IconUserCheck,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { useLeaveRequestDetails } from "@/hooks/useLeaveRequestDetails";

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
};

const statusColors: Record<string, string> = {
    approved: "green",
    rejected: "red",
    pending: "yellow",
};

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: React.ReactNode;
}) {
    return (
        <Group gap="sm" align="flex-start" wrap="nowrap">
            <Box mt={2} c="dimmed">
                {icon}
            </Box>
            <Box style={{ flex: 1 }}>
                <Text size="xs" c="dimmed" tt="uppercase" fw={700} component="div">
                    {label}
                </Text>
                <Text size="sm" fw={500} component="div">
                    {value}
                </Text>
            </Box>
        </Group>
    );
}

export default function LeaveRequestDetailsPage() {
    const params = useParams<{ id: string }>();
    const router = useRouter();
    const { request, loading, error } = useLeaveRequestDetails(params.id);

    if (loading) {
        return (
            <Flex justify="center" py="xl">
                <Loader />
            </Flex>
        );
    }

    if (error || !request) {
        return (
            <Container size="sm" py="lg">
                <Stack gap="md" align="center">
                    <Text c="dimmed">{error || "Leave request not found"}</Text>
                    <Button
                        onClick={() => router.back()}
                        leftSection={<IconArrowLeft size={16} />}
                        variant="light"
                    >
                        Back
                    </Button>
                </Stack>
            </Container>
        );
    }

    const manager = request.employee.managerId;

    return (
        <Container size="sm" py="lg" px={{ base: "xs", sm: "md" }}>
            <Stack gap="lg">
                <Group justify="space-between">
                    <Title order={2}>Leave Request Details</Title>
                    <Button
                        onClick={() => router.back()}
                        variant="subtle"
                        leftSection={<IconArrowLeft size={16} />}
                    >
                        Back
                    </Button>
                </Group>

                <Paper p={{ base: "md", sm: "xl" }} radius="md" withBorder>
                    <Stack gap="lg">
                        <Group justify="space-between" align="flex-start">
                            <Group gap="sm">
                                <Avatar
                                    name={`${request.employee.firstName} ${request.employee.lastName}`}
                                    radius="xl"
                                    size="lg"
                                    color="initials"
                                />
                                <Box>
                                    <Text size="lg" fw={600}>
                                        {request.employee.firstName} {request.employee.lastName}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {request.employee.department?.name ?? "No Department"}
                                    </Text>
                                </Box>
                            </Group>
                            <Badge
                                variant="dot"
                                color={statusColors[request.status]}
                                size="lg"
                            >
                                {statusLabels[request.status] ?? request.status}
                            </Badge>
                        </Group>

                        <Divider />

                        <Stack gap="md">
                            <InfoRow
                                icon={<IconMail size={18} />}
                                label="Email"
                                value={request.employee.email}
                            />

                            <InfoRow
                                icon={<IconBriefcase size={18} />}
                                label="Leave Type"
                                value={
                                    <Badge variant="light" color="blue" size="sm">
                                        {typeLabels[request.type] ?? request.type}
                                    </Badge>
                                }
                            />

                            <InfoRow
                                icon={<IconCalendarEvent size={18} />}
                                label="Leave Period"
                                value={`${dayjs(request.startDate).format("D MMM YYYY")} → ${dayjs(
                                    request.endDate
                                ).format("D MMM YYYY")}`}
                            />

                            <InfoRow
                                icon={<IconCalendarEvent size={18} />}
                                label="Working Days"
                                value={`${request.daysRequested} ${request.daysRequested === 1 ? "day" : "days"
                                    }`}
                            />

                            <InfoRow
                                icon={<IconUserCheck size={18} />}
                                label="Manager"
                                value={
                                    manager
                                        ? `${manager.firstName} ${manager.lastName}`
                                        : "No manager assigned"
                                }
                            />

                            <InfoRow
                                icon={<IconMessage size={18} />}
                                label="Employee Comment"
                                value={request.comment || "No comment provided"}
                            />

                            <InfoRow
                                icon={<IconUser size={18} />}
                                label="Submitted On"
                                value={dayjs(request.createdAt).format("D MMM YYYY, HH:mm")}
                            />
                        </Stack>
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}