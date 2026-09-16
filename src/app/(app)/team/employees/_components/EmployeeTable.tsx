'use client'

import { useState } from "react";
import { useRouter } from "next/navigation";

import { Stack, Group, Title, Badge, Button, Paper, Table, ActionIcon, Card, Text, useMatches, Menu, SegmentedControl } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus, IconKey, IconSend, IconDotsVertical, IconCheck, IconClock, IconX, IconUserOff, IconUserCheck } from "@tabler/icons-react";
import NewEmployeeModalContent from "./NewEmployeeModalCntent";
import EditEmployeeModal from "./EditEmployeeModal";
import ActivateEmployeeModal from "./ActivateEmployeeModal";
import DeleteEmployeeModal from "./DeleteEmployeeModal";
import type { IEmployee } from "@/types/employees";
import { sendPasswordReset } from "@/actions/admin/employees/sendPasswordReset";
import { resendInvitation } from "@/actions/admin/employees/resendInvitation";

function InvitationStatusBadge({ status }: { status: IEmployee["status"] }) {
    if (status === "active") {
        return (
            <Badge variant="light" color="green" size="sm" leftSection={<IconCheck size={12} />}>
                Accepted
            </Badge>
        );
    }

    if (status === "invited") {
        return (
            <Badge variant="light" color="blue" size="sm" leftSection={<IconClock size={12} />}>
                Invitation sent
            </Badge>
        );
    }

    return (
        <Badge variant="light" color="gray" size="sm">
            Inactive
        </Badge>
    );
}

function EmployeeActionsMenu({ employee }: { employee: IEmployee }) {
    function openEditModal() {
        modals.open({
            modalId: "edit-employee-modal",
            title: "Edit employee",
            size: "lg",
            children: (
                <EditEmployeeModal
                    closeModal={() => modals.close("edit-employee-modal")}
                    employee={employee}
                />
            ),
        });
    }

    function openActivateModal() {
        modals.open({
            modalId: "activate-employee-modal",
            title: "Activate Employee",
            centered: true,
            children: (
                <ActivateEmployeeModal
                    closeModal={() => modals.close("activate-employee-modal")}
                    employee={employee}
                />
            ),
        });
    }

    function openDeactivateModal() {
        modals.open({
            modalId: "deactivate-employee-modal",
            title: "Deactivate Employee",
            centered: true,
            children: (
                <DeleteEmployeeModal
                    closeModal={() => modals.close("deactivate-employee-modal")}
                    employee={employee}
                />
            ),
        });
    }

    function openPasswordResetModal() {
        modals.openConfirmModal({
            modalId: "password-reset-modal",
            title: "Reset password",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to send a password reset link to{" "}
                    <Text component="span" fw={600}>
                        {employee.firstName} {employee.lastName}
                    </Text>
                    ? They will receive an email with instructions to reset their password.
                </Text>
            ),
            labels: { confirm: "Yes, send reset link", cancel: "Cancel" },
            confirmProps: { color: "blue" },
            onConfirm: async () => {
                const { success, error } = await sendPasswordReset(employee._id);
                if (success) {
                    notifications.show({
                        title: "Success",
                        message: `Password reset link sent to ${employee.email}`,
                        color: "green",
                    });
                } else {
                    notifications.show({
                        title: "Error",
                        message: error || "Failed to send password reset email",
                        color: "red",
                        icon: <IconX size={16} />,
                    });
                }
            },
        });
    }

    function openResendInvitationModal() {
        modals.openConfirmModal({
            modalId: "resend-invitation-modal",
            title: "Resend invitation",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to resend the invitation to{" "}
                    <Text component="span" fw={600}>
                        {employee.firstName} {employee.lastName}
                    </Text>
                    ? They will receive a new invitation email.
                </Text>
            ),
            labels: { confirm: "Yes, resend invitation", cancel: "Cancel" },
            confirmProps: { color: "blue" },
            onConfirm: async () => {
                const { success, error } = await resendInvitation(employee._id);
                if (success) {
                    notifications.show({
                        title: "Success",
                        message: `Invitation re-sent to ${employee.email}`,
                        color: "green",
                    });
                } else {
                    notifications.show({
                        title: "Error",
                        message: error || "Failed to resend invitation",
                        color: "red",
                        icon: <IconX size={16} />,
                    });
                }
            },
        });
    }

    return (
        <Menu shadow="md" width={220} position="bottom-end" withinPortal>
            <Menu.Target>
                <ActionIcon variant="subtle" aria-label="Employee actions" size="sm">
                    <IconDotsVertical size={16} />
                </ActionIcon>
            </Menu.Target>

            <Menu.Dropdown>
                <Menu.Item
                    leftSection={<IconEdit size={16} />}
                    onClick={openEditModal}
                >
                    Edit
                </Menu.Item>

                {employee.status === "active" && (
                    <Menu.Item
                        leftSection={<IconKey size={16} />}
                        onClick={openPasswordResetModal}
                    >
                        Reset password
                    </Menu.Item>
                )}

                {employee.status === "invited" && (
                    <Menu.Item
                        leftSection={<IconSend size={16} />}
                        onClick={openResendInvitationModal}
                    >
                        Resend invitation
                    </Menu.Item>
                )}

                {(employee.status === "active" || employee.status === "invited") && !employee.isOwner && (
                    <>
                        <Menu.Divider />
                        <Menu.Item
                            color="orange"
                            leftSection={<IconUserOff size={16} />}
                            onClick={openDeactivateModal}
                        >
                            Deactivate
                        </Menu.Item>
                    </>
                )}

                {employee.status === "inactive" && (
                    <>
                        <Menu.Divider />
                        <Menu.Item
                            color="green"
                            leftSection={<IconUserCheck size={16} />}
                            onClick={openActivateModal}
                        >
                            Activate
                        </Menu.Item>
                    </>
                )}
            </Menu.Dropdown>
        </Menu>
    );
}

export default function EmployeeTable({ employees }: { employees: IEmployee[] }) {
    const router = useRouter();
    const isMobile = useMatches({
        base: true,
        sm: false,
    });

    const [filter, setFilter] = useState<"active" | "inactive">("active");

    const filteredEmployees = employees.filter((empl) => {
        if (filter === "active") {
            return empl.status === "active" || empl.status === "invited";
        } else {
            return empl.status === "inactive";
        }
    });

    function openNewEmployeeModal() {
        modals.open({
            modalId: "new-employee-modal",
            title: "New employee",
            size: "lg",
            children: <NewEmployeeModalContent />
        })
    }

    function openEditModal(employee: IEmployee) {
        modals.open({
            modalId: "edit-employee-modal",
            title: "Edit employee",
            size: "lg",
            children: (
                <EditEmployeeModal
                    closeModal={() => modals.close("edit-employee-modal")}
                    employee={employee}
                />
            ),
        });
    }

    function openDeleteModal(employee: IEmployee) {
        modals.open({
            modalId: "delete-employee-modal",
            title: "Delete Employee",
            centered: true,
            children: (
                <DeleteEmployeeModal
                    closeModal={() => modals.close("delete-employee-modal")}
                    employee={employee}
                />
            ),
        });
    }

    function openPasswordResetModal(employee: IEmployee) {
        modals.openConfirmModal({
            modalId: "password-reset-modal",
            title: "Reset password",
            centered: true,
            children: (
                <Text size="sm">
                    Are you sure you want to send a password reset link to{" "}
                    <Text component="span" fw={600}>
                        {employee.firstName} {employee.lastName}
                    </Text>
                    ? They will receive an email with instructions to reset their password.
                </Text>
            ),
            labels: { confirm: "Yes, send reset link", cancel: "Cancel" },
            confirmProps: { color: "blue" },
            onConfirm: async () => {
                const { success, error } = await sendPasswordReset(employee._id);
                if (success) {
                    notifications.show({
                        title: "Success",
                        message: `Password reset link sent to ${employee.email}`,
                        color: "green",
                    });
                } else {
                    notifications.show({
                        title: "Error",
                        message: error || "Failed to send password reset email",
                        color: "red",
                        icon: <IconX size={16} />,
                    });
                }
            },
        });
    }

    const rows = filteredEmployees.map((empl) => (
        <Table.Tr
            key={empl.email}
            onClick={() => router.push(`/team/employees/${empl._id}/profile`)}
            style={{ cursor: "pointer" }}
        >
            <Table.Td fw={600}>{empl.firstName} {empl.lastName}</Table.Td>
            <Table.Td>{empl.email}</Table.Td>
            <Table.Td>{typeof empl.department === 'object' ? empl.department?.name ?? "-" : empl.department ?? "-"}</Table.Td>
            <Table.Td>{empl.role}</Table.Td>
            <Table.Td>
                <InvitationStatusBadge status={empl.status} />
            </Table.Td>
            <Table.Td onClick={(e) => e.stopPropagation()}>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                    <EmployeeActionsMenu employee={empl} />
                </Group>
            </Table.Td>
        </Table.Tr>
    ))

    const mobileCards = filteredEmployees.map((empl) => (
        <Card
            key={empl.email}
            withBorder
            shadow="xs"
            radius="md"
            padding="md"
            onClick={() => router.push(`/team/employees/${empl._id}/profile`)}
            style={{ cursor: "pointer" }}
        >
            <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
                <div>
                    <Text fw={600} size="md">
                        {empl.firstName} {empl.lastName}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {empl.email}
                    </Text>
                </div>
                <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
                    <EmployeeActionsMenu employee={empl} />
                </Group>
            </Group>

            <Group justify="space-between" align="center" mt="sm">
                <Text size="xs" c="dimmed">
                    Department
                </Text>
                <Text size="sm">
                    {typeof empl.department === 'object' ? empl.department?.name ?? "-" : empl.department ?? "-"}
                </Text>
            </Group>

            <Group justify="space-between" align="center" mt="xs">
                <Text size="xs" c="dimmed">
                    Role
                </Text>
                <Badge variant="light" size="sm">
                    {empl.role}
                </Badge>
            </Group>
        <Group justify="space-between" align="center" mt="xs">
                <Text size="xs" c="dimmed">
                    Invitation
                </Text>
                <InvitationStatusBadge status={empl.status} />
            </Group>
        </Card>
    ));

    return (
        <Stack gap="lg">
            <Group justify="space-between" >
                <div>
                    <Title order={2} fw='700'>Employees</Title>
                    <SegmentedControl
                        value={filter}
                        onChange={(value) => setFilter(value as "active" | "inactive")}
                        data={[
                            { value: "active", label: `Active (${employees.filter(e => e.status === "active" || e.status === "invited").length})` },
                            { value: "inactive", label: `Deactivated (${employees.filter(e => e.status === "inactive").length})` },
                        ]}
                        size="xs"
                    />
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={openNewEmployeeModal}>
                    Add employee
                </Button>
            </Group>

            {isMobile ? (
                <Stack gap="sm">
                    {filteredEmployees.length > 0 ? (
                        mobileCards
                    ) : (
                        <Paper withBorder p="md" radius="md">
                            <Text size="sm" c="dimmed" ta="center">
                                {filter === "active" ? "No active employees." : "No deactivated employees."}
                            </Text>
                        </Paper>
                    )}
                </Stack>
            ) : (
                <Paper withBorder shadow="xs" radius="md">
                    <Table>
                        <Table.Thead>
                            <Table.Tr>
                                <Table.Th>Name</Table.Th>
                                <Table.Th>Email</Table.Th>
                                <Table.Th>Department</Table.Th>
                                <Table.Th>Role</Table.Th>
                                <Table.Th>Invitation</Table.Th>
                                <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.length > 0 ? (
                                rows
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={6}>{filter === "active" ? "No active employees." : "No deactivated employees."}</Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}
        </Stack>
    )
}