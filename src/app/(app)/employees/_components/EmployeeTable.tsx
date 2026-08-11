'use client'

import { Stack, Group, Title, Badge, Button, Paper, Table, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import NewEmployeeModalContent from "./NewEmplayeeModalCntent";
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

    const rows = employees.map((empl) => (
        <Table.Tr key={empl.email}>
            <Table.Td>{empl.firstName} {empl.lastName}</Table.Td>
            <Table.Td>{empl.email}</Table.Td>
            <Table.Td>{typeof empl.department === 'object' ? empl.department?.name ?? "-" : empl.department ?? "-"}</Table.Td>
            <Table.Td>{empl.role}</Table.Td>
            <Table.Td>Zzzz</Table.Td>
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
                            <Table.Th>Actions</Table.Th>
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