'use client';

import { Button, Group, TextInput, Text } from "@mantine/core";
import { useState } from "react";
import { createDepartment } from "@/actions/departmentsActions";

export default function NewDepartmentModal({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const [name, setName] = useState("");
  const [manager, setManager] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    setLoading(true);

    const result = await createDepartment({ name, manager });

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