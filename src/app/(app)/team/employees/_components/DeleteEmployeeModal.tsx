'use client';

import { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { deactivateEmployee } from "@/actions/admin/employees/deactivateEmployee";
import type { IEmployee } from "@/types/employees";

export default function DeactivateEmployeeModal({
    closeModal,
    employee,
}: {
    closeModal: () => void;
    employee: IEmployee;
}) {
    const [deactivating, setDeactivating] = useState(false);
    const [deactivateError, setDeactivateError] = useState<string | null>(null);

    async function handleDeactivate() {
        setDeactivating(true);
        setDeactivateError(null);

        const result = await deactivateEmployee(employee._id);

        setDeactivating(false);

        if (result.success) {
            closeModal();
        } else {
            setDeactivateError(result.error || "An error occurred");
        }
    }

    return (
        <>
            <Text size="sm">
                Are you sure you want to deactivate{" "}
                <Text component="span" fw={600}>
                    {employee.firstName} {employee.lastName}
                </Text>
                ? They will no longer be able to log in, but their historical data will be preserved in the system.
            </Text>
            {deactivateError && (
                <Text c="red" size="sm" mt="xs">
                    {deactivateError}
                </Text>
            )}
            <Group grow mt="md">
                <Button
                    variant="light"
                    onClick={closeModal}
                    disabled={deactivating}
                >
                    Cancel
                </Button>
                <Button
                    color="orange"
                    onClick={handleDeactivate}
                    loading={deactivating}
                >
                    Deactivate
                </Button>
            </Group>
        </>
    );
}