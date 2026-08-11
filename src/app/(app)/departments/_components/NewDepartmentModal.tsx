'use client';

import { Button, Group, TextInput, MultiSelect } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { createDepartment } from "@/actions/departmentsActions";
import { useManagers } from "@/hooks/useManagers";

export default function NewDepartmentModal({
  closeModal,
}: {
  closeModal: () => void;
}) {
  const [loading, setLoading] = useState(false);
  const { data: managers, isLoading: isLoadingManagers, error: errorManagers } = useManagers();

  const form = useForm({
    initialValues: {
      name: "",
      managerIds: [] as string[],
    },
    validate: {
      name: (value) => (value.trim().length === 0 ? "Department name is required" : null),
    },
  });

  async function handleSubmit() {
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    setLoading(true);

    const result = await createDepartment({
      name: form.values.name,
      managerIds: form.values.managerIds.length > 0 ? form.values.managerIds : undefined,
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

      <MultiSelect
        label="Managers"
        placeholder={isLoadingManagers ? "Loading managers..." : managers?.length ? "Select managers" : "No managers found"}
        mt="md"
        {...form.getInputProps("managerIds")}
        data={managers?.map((manager) => ({
          value: manager._id,
          label: manager.firstName + " " + manager.lastName,
        }))}
        disabled={loading || isLoadingManagers}
        clearable
        searchable
        nothingFoundMessage="No managers found"
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