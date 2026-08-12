'use client'

import { Stack, Group, Title, Badge, Button, Paper, Table, ActionIcon, Card, Text, useMatches } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import NewEmployeeModalContent from "./NewEmplayeeModalCntent";
import EditEmployeeModal from "./EditEmployeeModal";
import DeleteEmployeeModal from "./DeleteEmployeeModal";
import type { IEmployee } from "@/types/employees";

export default function EmployeeTable({ employees }: { employees: IEmployee[] }) {
    const isMobile = useMatches({
        base: true,
        sm: false,
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

    const rows = employees.map((empl) => (
        <Table.Tr key={empl.email}>
            <Table.Td>{empl.firstName} {empl.lastName}</Table.Td>
            <Table.Td>{empl.email}</Table.Td>
            <Table.Td>{typeof empl.department === 'object' ? empl.department?.name ?? "-" : empl.department ?? "-"}</Table.Td>
            <Table.Td>{empl.role}</Table.Td>
            <Table.Td>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                    <ActionIcon
                        variant="subtle"
                        aria-label="Edit employee"
                        size="sm"
                        onClick={() => openEditModal(empl)}
                    >
                        <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete employee"
                        size="sm"
                        onClick={() => openDeleteModal(empl)}
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
            </Table.Td>
        </Table.Tr>
    ))

    const mobileCards = employees.map((empl) => (
        <Card key={empl.email} withBorder shadow="xs" radius="md" padding="md">
            <Group justify="space-between" align="flex-start" mb="xs" wrap="nowrap">
                <div>
                    <Text fw={600} size="md">
                        {empl.firstName} {empl.lastName}
                    </Text>
                    <Text size="xs" c="dimmed">
                        {empl.email}
                    </Text>
                </div>
                <Group gap={4} wrap="nowrap">
                    <ActionIcon
                        variant="subtle"
                        aria-label="Edit employee"
                        size="md"
                        onClick={() => openEditModal(empl)}
                    >
                        <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete employee"
                        size="md"
                        onClick={() => openDeleteModal(empl)}
                    >
                        <IconTrash size={18} />
                    </ActionIcon>
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
        </Card>
    ));

    return (
        <Stack gap="lg">
            <Group justify="space-between" >
                <div>
                    <Title order={2} fw='700'>Employees</Title>
                    <Badge variant="light" color="blue" size="md" mt="xs">
                        {employees.length} Employees
                    </Badge>
                </div>
                <Button leftSection={<IconPlus size={16} />} onClick={openNewEmployeeModal}>
                    Add employee
                </Button>
            </Group>

            {isMobile ? (
                <Stack gap="sm">
                    {employees.length > 0 ? (
                        mobileCards
                    ) : (
                        <Paper withBorder p="md" radius="md">
                            <Text size="sm" c="dimmed" ta="center">
                                No employees yet.
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
                                <Table.Th style={{ textAlign: "right" }}>Actions</Table.Th>
                            </Table.Tr>
                        </Table.Thead>
                        <Table.Tbody>
                            {rows.length > 0 ? (
                                rows
                            ) : (
                                <Table.Tr>
                                    <Table.Td colSpan={5}>No employees yet.</Table.Td>
                                </Table.Tr>
                            )}
                        </Table.Tbody>
                    </Table>
                </Paper>
            )}
        </Stack>
    )
}