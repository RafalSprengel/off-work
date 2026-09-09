'use client';

import { useState } from "react";
import { Button, Group, Text } from "@mantine/core";
import { activateEmployee } from "@/actions/admin/employees/activateEmployee";
import type { IEmployee } from "@/types/employees";

export default function ActivateEmployeeModal({
    closeModal,
    employee,
}: {
    closeModal: () => void;
    employee: IEmployee;
}) {
    const [activating, setActivating] = useState(false);
    const [activateError, setActivateError] = useState<string | null>(null);

    async function handleActivate() {
        setActivating(true);
        setActivateError(null);

        const result = await activateEmployee(employee._id);

        setActivating(false);

        if (result.success) {
            closeModal();
        } else {
            setActivateError(result.error || "An error occurred");
        }
    }

    return (
        <>
            <Text size="sm">
                Are you sure you want to activate{" "}
                <Text component="span" fw={600}>
                    {employee.firstName} {employee.lastName}
                </Text>
                ? A reactivation email will be sent to{" "}
                <Text component="span" fw={600}>
                    {employee.email}
                </Text>{" "}
                with a link to log in. All their historical data will remain intact.
            </Text>
            {activateError && (
                <Text c="red" size="sm" mt="xs">
                    {activateError}
                </Text>
            )}
            <Group grow mt="md">
                <Button
                    variant="light"
                    onClick={closeModal}
                    disabled={activating}
                >
                    Cancel
                </Button>
                <Button
                    color="green"
                    onClick={handleActivate}
                    loading={activating}
                >
                    Activate
                </Button>
            </Group>
        </>
    );
}