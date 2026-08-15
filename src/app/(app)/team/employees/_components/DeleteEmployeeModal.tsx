'use client';

import { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { deleteEmployee } from "@/actions/admin/employees/deleteEmployee";
import type { IEmployee } from "@/types/employees";

export default function DeleteEmployeeModal({
    closeModal,
    employee,
}: {
    closeModal: () => void;
    employee: IEmployee;
}) {
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleDelete() {
        setDeleting(true);
        setDeleteError(null);

        const result = await deleteEmployee(employee._id);

        setDeleting(false);

        if (result.success) {
            closeModal();
        } else {
            setDeleteError(result.error || "An error occurred");
        }
    }

    return (
        <>
            <Text size="sm">
                Are you sure you want to delete{" "}
                <Text component="span" fw={600}>
                    {employee.firstName} {employee.lastName}
                </Text>
                ? This action cannot be undone.
            </Text>
            {deleteError && (
                <Text c="red" size="sm" mt="xs">
                    {deleteError}
                </Text>
            )}
            <Group grow mt="md">
                <Button
                    variant="light"
                    onClick={closeModal}
                    disabled={deleting}
                >
                    Cancel
                </Button>
                <Button
                    color="red"
                    onClick={handleDelete}
                    loading={deleting}
                >
                    Delete
                </Button>
            </Group>
        </>
    );
}