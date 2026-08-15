'use client';

import { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { deleteDepartment } from "@/actions/admin/departments/deleteDepartment";
import type { IDepartment } from "@/types/department";

export default function DeleteDepartmentModal({
    closeModal,
    department,
}: {
    closeModal: () => void;
    department: IDepartment;
}) {
    const [deleting, setDeleting] = useState(false);
    const [deleteError, setDeleteError] = useState<string | null>(null);

    async function handleDelete() {
        setDeleting(true);
        setDeleteError(null);

        const result = await deleteDepartment(department._id);

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
                    {department.name}
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