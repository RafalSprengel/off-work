'use client';

import { Button, Group, TextInput } from "@mantine/core";
import { useState } from "react";
import { updateDepartment } from "@/actions/departmentsActions";

export default function EditDepartmentModal({
    closeModal,
    _id,
    name: initialName,
    manager: initialManager,
}: {
    closeModal: () => void;
    _id: string;
    name: string;
    manager?: string;
}) {
    const [name, setName] = useState(initialName);
    const [manager, setManager] = useState(initialManager);
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleSubmit() {
        setError(null);
        setLoading(true);
        const result = await updateDepartment({ _id, name, manager });

        setLoading(false);

        if (result.success) {
            closeModal();
        } else {
            setError(result.error || "An error occurred");
        }
    }

    return (
        <div>
            <TextInput
                label="Department name"
                placeholder="e.g. Fabrication"
                value={name}
                onChange={(e) => setName(e.currentTarget.value)}
                error={error}
                disabled={loading}
            />
            <TextInput
                label="Manager"
                placeholder="e.g. John Doe"
                mt="md"
                value={manager}
                onChange={(e) => setManager(e.currentTarget.value)}
                disabled={loading}
            />

            <Group grow mt="md">
                <Button onClick={closeModal} variant="light" disabled={loading}>
                    Close
                </Button>
                <Button onClick={handleSubmit} loading={loading}>
                    Save
                </Button>
            </Group>
        </div>
    );
}