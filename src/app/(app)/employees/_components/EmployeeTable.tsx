'use client'

import { Stack, Group, Title, Badge, Button, Paper, Table, ActionIcon } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import NewEmployeeModalContent from "./NewEmplayeeModalCntent";
import EditEmployeeModal from "./EditEmployeeModal";
import DeleteEmployeeModal from "./DeleteEmployeeModal";
import type { IEmployee } from "@/types/employees";

export default function EmployeeTable({ employees }: { employees: IEmployee[] }) {
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
                        {rows}
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    )
}