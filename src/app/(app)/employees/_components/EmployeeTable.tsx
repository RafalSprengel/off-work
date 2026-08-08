'use client'

import { Stack, Group, Title, Badge, Button, Paper, Table, Text } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import NewEmployeeModalContent from "./NewEmplayeeModalCntent";

export default function EmployeeTable() {

    function openNewEmployeeModal() {

        modals.open({
            modalId: "new-employee-modal",
            title: "New employee",
            size: "lg",
            children: <NewEmployeeModalContent />
        })
    }

    return (
        <Stack gap="lg">
            <Group justify="space-between" >
                <div>
                    <Title order={2} fw='700'>Employees</Title>
                    <Badge variant="light" color="blue" size="md" mt="xs">
                        123
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
                        <Table.Tr>
                            <Table.Td>Zzzz</Table.Td>
                            <Table.Td>Zzzz</Table.Td>
                            <Table.Td>Zzzz</Table.Td>
                            <Table.Td>Zzzz</Table.Td>
                            <Table.Td>Zzzz</Table.Td>
                        </Table.Tr>
                    </Table.Tbody>
                </Table>
            </Paper>
        </Stack>
    )
}