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
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import {
    IconArrowLeft,
    IconBriefcase,
    IconCalendarEvent,
    IconCancel,
    IconCheck,
    IconClock,
    IconMail,
    IconMessage,
    IconUser,
    IconUserCheck,
    IconUserPlus,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import { useParams, useRouter } from "next/navigation";
import { useLeaveRequestDetails } from "@/hooks/useLeaveRequestDetails";
import { cancelLeaveRequestAsAdmin } from "@/actions/admin/leave/cancelLeaveRequest";
import { useState } from "react";

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
    const [cancelling, setCancelling] = useState(false);

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

    const snapshot = request.snapshot;
    const canCancel = request.status === "pending" || request.status === "approved";

    const handleCancel = () => {
        modals.openConfirmModal({
            title: "Cancel Leave Request",
            children: (
                <Text size="sm">
                    Are you sure you want to cancel this leave request? This action cannot be
                    undone.
                </Text>
            ),
            labels: { confirm: "Cancel Request", cancel: "Go Back" },
            confirmProps: { color: "red" },
            onConfirm: async () => {
                setCancelling(true);
                const result = await cancelLeaveRequestAsAdmin(request._id);
                setCancelling(false);

                if (result.success) {
                    notifications.show({
                        title: "Cancelled",
                        message: "Leave request has been cancelled.",
                        color: "green",
                    });
                    router.refresh();
                } else {
                    notifications.show({
                        title: "Error",
                        message: result.error || "Failed to cancel request",
                        color: "red",
                    });
                }
            },
        });
    };

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
                                    name={snapshot.employeeName}
                                    radius="xl"
                                    size="lg"
                                    color="initials"
                                />
                                <Box>
                                    <Text size="lg" fw={600}>
                                        {snapshot.employeeName}
                                    </Text>
                                    <Text size="sm" c="dimmed">
                                        {snapshot.departmentName}
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
                                value={snapshot.employeeEmail}
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
                                value={snapshot.managerName || "No manager assigned"}
                            />
                            <InfoRow
                                icon={<IconMessage size={18} />}
                                label="Employee Comment"
                                value={request.comment || "No comment provided"}
                            />

                            {/* === REJECTION REASON === */}
                            {request.status === "rejected" && request.rejectionReason && (
                                <InfoRow
                                    icon={<IconCancel size={18} />}
                                    label="Rejection Reason"
                                    value={
                                        <Text c="red" fw={500}>
                                            {request.rejectionReason}
                                        </Text>
                                    }
                                />
                            )}

                            <Divider my="xs" />

                            {/* === AUDIT: CREATED BY === */}
                            <InfoRow
                                icon={<IconUserPlus size={18} />}
                                label="Created By"
                                value={
                                    <Badge variant="light" color="blue" size="sm">
                                        Self — {snapshot.employeeName}
                                    </Badge>
                                }
                            />

                            {/* === AUDIT: APPROVED BY === */}
                            {(request.status === "approved" || request.status === "rejected") && (
                                <InfoRow
                                    icon={<IconCheck size={18} />}
                                    label={request.status === "approved" ? "Approved By" : "Reviewed By"}
                                    value={
                                        <Group gap="xs" wrap="nowrap">
                                            <Text fw={500}>
                                                {snapshot.approvedByName || "Account has been deleted"}
                                            </Text>
                                            {request.approvedAt && (
                                                <Badge variant="light" color="gray" size="xs">
                                                    <Group gap={4} wrap="nowrap">
                                                        <IconClock size={12} />
                                                        {dayjs(request.approvedAt).format(
                                                            "D MMM YYYY, HH:mm"
                                                        )}
                                                    </Group>
                                                </Badge>
                                            )}
                                        </Group>
                                    }
                                />
                            )}

                            {/* === AUDIT: CANCELLED === */}
                            {request.status === "cancelled" && request.cancelledAt && (
                                <InfoRow
                                    icon={<IconCancel size={18} />}
                                    label="Cancelled On"
                                    value={dayjs(request.cancelledAt).format(
                                        "D MMM YYYY, HH:mm"
                                    )}
                                />
                            )}

                            <InfoRow
                                icon={<IconUser size={18} />}
                                label="Submitted On"
                                value={dayjs(request.createdAt).format("D MMM YYYY, HH:mm")}
                            />
                        </Stack>

                        {/* === CANCEL BUTTON === */}
                        {canCancel && (
                            <>
                                <Divider my="xs" />
                                <Flex justify="flex-end">
                                    <Button
                                        color="red"
                                        variant="light"
                                        leftSection={<IconCancel size={16} />}
                                        onClick={handleCancel}
                                        loading={cancelling}
                                    >
                                        Cancel Request
                                    </Button>
                                </Flex>
                            </>
                        )}
                    </Stack>
                </Paper>
            </Stack>
        </Container>
    );
}