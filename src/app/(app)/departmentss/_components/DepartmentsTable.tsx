'use client';

import {
    ActionIcon,
    Badge,
    Button,
    Group,
    Paper,
    Stack,
    Table,
    TableScrollContainer,
    TableTbody,
    TableTd,
    TableTh,
    TableThead,
    TableTr,
    Text,
    Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import type { IDepartment } from "@/types/department";
import NewDepartmentModal from "./NewDepartmentModal";
import EditDepartmentModal from "./EditDepartmentModal";
import DeleteDepartmentModal from "./DeleteDepartmentModal";

export default function DepartmentsTable({
    departments,
}: {
    departments: IDepartment[];
}) {
    function openNewModal() {
        modals.open({
            modalId: "new-department",
            title: "Add a new department",
            centered: true,
            children: (
                <NewDepartmentModal
                    closeModal={() => modals.close("new-department")}
                />
            ),
        });
    }

    function openEditModal(dept: IDepartment) {
        modals.open({
            modalId: "edit-department",
            title: "Edit Department",
            centered: true,
            children: (
                <EditDepartmentModal
                    closeModal={() => modals.close("edit-department")}
                    _id={dept._id}
                    name={dept.name}
                    manager={dept.manager}
                />
            ),
        });
    }

    function openDeleteModal(dept: IDepartment) {
        modals.open({
            modalId: "delete-department",
            title: "Delete Department",
            centered: true,
            children: (
                <DeleteDepartmentModal
                    closeModal={() => modals.close("delete-department")}
                    department={dept}
                />
            ),
        });
    }

    const rows = departments.map((dept) => (
        <TableTr key={dept._id}>
            <TableTd>
                <Text fw={500} size="sm">
                    {dept.name}
                </Text>
            </TableTd>
            <TableTd>
                <Text size="sm">{dept.manager}</Text>
            </TableTd>
            <TableTd>
                <Text size="sm">10</Text>
            </TableTd>
            <TableTd>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                    <ActionIcon
                        variant="subtle"
                        color="blue"
                        aria-label="Edit department"
                        size="sm"
                        onClick={() => openEditModal(dept)}
                    >
                        <IconEdit size={16} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete department"
                        size="sm"
                        onClick={() => openDeleteModal(dept)}
                    >
                        <IconTrash size={16} />
                    </ActionIcon>
                </Group>
            </TableTd>
        </TableTr>
    ));

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="flex-start">
                <div>
                    <Title order={2} fw={700}>
                        Departments
                    </Title>
                    <Badge variant="light" color="blue" size="md" mt="xs">
                        {departments.length} DEPARTMENTS
                    </Badge>
                </div>
                <Button
                    color="green"
                    leftSection={<IconPlus size={16} />}
                    onClick={openNewModal}
                >
                    New
                </Button>
            </Group>

            <Paper withBorder shadow="xs" radius="md">
                <TableScrollContainer minWidth={500}>
                    <Table verticalSpacing="sm" horizontalSpacing="md">
                        <TableThead>
                            <TableTr>
                                <TableTh>Name</TableTh>
                                <TableTh>Manager</TableTh>
                                <TableTh>Employees</TableTh>
                                <TableTh style={{ textAlign: "right" }}>Actions</TableTh>
                            </TableTr>
                        </TableThead>
                        <TableTbody>
                            {rows.length > 0 ? (
                                rows
                            ) : (
                                <TableTr>
                                    <TableTd colSpan={4}>No departments yet.</TableTd>
                                </TableTr>
                            )}
                        </TableTbody>
                    </Table>
                </TableScrollContainer>
            </Paper>
        </Stack>
    );
}