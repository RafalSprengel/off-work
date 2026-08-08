'use client';

import { Button, Group, TextInput } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { createDepartment } from "@/actions/departmentsActions";

export default function NewDepartmentModal({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const [loading, setLoading] = useState(false);

  const form = useForm({
    initialValues: {
      name: "",
      manager: "",
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Department name is required" : null),
      manager: (value) => (value.trim().length === 0 ? "Manager is required" : null),
    },
  });

  async function handleSubmit() {
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    setLoading(true);

    const result = await createDepartment({
      name: form.values.name,
      manager: form.values.manager,
    });

    setLoading(false);

    if (result.success) {
      closeModal();
    } else {
      form.setFieldError("name", result.error || "An error occurred");
    }
  }

  return (
    <div>
      <TextInput
        label="Department name"
        placeholder="e.g. Fabrication"
        {...form.getInputProps("name")}
        disabled={loading}
      />
      <TextInput
        label="Manager"
        placeholder="e.g. John Doe"
        mt="md"
        {...form.getInputProps("manager")}
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