'use client';

import {
    ActionIcon,
    Badge,
    Button,
    Card,
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
    useMatches,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit, IconPlus, IconTrash } from "@tabler/icons-react";
import { useState } from "react";
import type { IDepartment } from "@/types/department";
import SortableHeader from "@/app/(app)/components/SortableHeader/SortableHeader";
import { sortItems, type SortDirection } from "@/utils/sort";
import NewDepartmentModal from "./NewDepartmentModal";
import EditDepartmentModal from "./EditDepartmentModal";
import DeleteDepartmentModal from "./DeleteDepartmentModal";

type SortColumn = "name" | "manager" | "employees";

export default function DepartmentsTable({
    departments,
}: {
    departments: IDepartment[];
}) {
    const isMobile = useMatches({
        base: true,
        sm: false,
    });

    const [sortColumn, setSortColumn] = useState<SortColumn | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    function handleSort(column: SortColumn) {
        if (sortColumn === column) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortColumn(column);
            setSortDirection("asc");
        }
    }

    function getManagerNames(dept: IDepartment): string {
        return dept.managers && dept.managers.length > 0
            ? dept.managers.map((m) => `${m.firstName} ${m.lastName}`).join(", ")
            : "";
    }

    const sortedDepartments = sortColumn
        ? sortItems(
              departments,
              (dept) => {
                  switch (sortColumn) {
                      case "name":
                          return dept.name;
                      case "manager":
                          return getManagerNames(dept);
                      case "employees":
                          return dept.employeeCount ?? 0;
                  }
              },
              sortDirection,
          )
        : departments;

    function openNewDeptModal() {
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
                    manager={dept.managers?.[0]}
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
    const rows = sortedDepartments.map((dept) => (
        <TableTr key={dept._id}>
            <TableTd>
                <Text fw={500} size="sm">
                    {dept.name}
                </Text>
            </TableTd>
            <TableTd>
                <Text size="sm">
                    {dept.managers?.length === 0 ? "-"
                        : dept.managers && dept.managers.length > 0
                            ? dept.managers.map((m) => m.firstName + " " + m.lastName).join(", ")
                            : ""}
                </Text>
            </TableTd>
            <TableTd>
                <Text size="sm">{dept.employeeCount ?? 0}</Text>
            </TableTd>
            <TableTd>
                <Group gap={4} justify="flex-end" wrap="nowrap">
                    <ActionIcon
                        variant="subtle"
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

    const mobileCards = sortedDepartments.map((dept) => (
        <Card key={dept._id} withBorder shadow="xs" radius="md" padding="md">
            <Group justify="space-between" align="flex-start" mb="xs">
                <div>
                    <Text fw={600} size="md">
                        {dept.name}
                    </Text>
                    {dept.managers && (
                        <Text size="xs" c="dimmed">
                            Managers: {dept.managers.length > 0 ? dept.managers.map((m) => m.firstName + " " + m.lastName).join(", ") : "-"}
                        </Text>
                    )}
                </div>
                <Group gap={4} wrap="nowrap">
                    <ActionIcon
                        variant="subtle"
                        aria-label="Edit department"
                        size="md"
                        onClick={() => openEditModal(dept)}
                    >
                        <IconEdit size={18} />
                    </ActionIcon>
                    <ActionIcon
                        variant="subtle"
                        color="red"
                        aria-label="Delete department"
                        size="md"
                        onClick={() => openDeleteModal(dept)}
                    >
                        <IconTrash size={18} />
                    </ActionIcon>
                </Group>
            </Group>

            <Group justify="space-between" align="center" mt="sm">
                <Text size="xs" c="dimmed">
                    Employees
                </Text>
                <Badge variant="flat" size="sm">
                    {dept.employeeCount ?? 0}
                </Badge>
            </Group>
        </Card>
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

                    leftSection={<IconPlus size={16} />}
                    onClick={openNewDeptModal}
                >
                    New
                </Button>
            </Group>

            {isMobile ? (
                <Stack gap="sm">
                    {departments.length > 0 ? (
                        mobileCards
                    ) : (
                        <Paper withBorder p="md" radius="md">
                            <Text size="sm" c="dimmed" ta="center">
                                No departments yet.
                            </Text>
                        </Paper>
                    )}
                </Stack>
            ) : (
                <Paper withBorder shadow="xs" radius="md">
                    <Table verticalSpacing="sm" horizontalSpacing="md">
                        <TableThead>
                            <TableTr>
                                <TableTh>
                                    <SortableHeader label="Name" active={sortColumn === "name"} direction={sortDirection} onSort={() => handleSort("name")} />
                                </TableTh>
                                <TableTh>
                                    <SortableHeader label="Manager" active={sortColumn === "manager"} direction={sortDirection} onSort={() => handleSort("manager")} />
                                </TableTh>
                                <TableTh>
                                    <SortableHeader label="Employees" active={sortColumn === "employees"} direction={sortDirection} onSort={() => handleSort("employees")} />
                                </TableTh>
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
                </Paper>
            )}
        </Stack>
    );
}