"use client";

import { ActionIcon, Tooltip } from "@mantine/core";
import { modals } from "@mantine/modals";
import { IconEdit } from "@tabler/icons-react";
import EditEmployeeModal from "@/app/(app)/team/employees/_components/EditEmployeeModal";
import type { EmployeeDetail } from "@/actions/manager/employees/getEmployeeById";

export default function EmployeeProfileEditButton({
  employee,
}: {
  employee: EmployeeDetail;
}) {
  function openEditModal() {
    modals.open({
      modalId: "edit-employee-modal",
      title: "Edit employee",
      size: "lg",
      children: (
        <EditEmployeeModal
          closeModal={() => modals.close("edit-employee-modal")}
          employee={employee}
        />
      ),
    });
  }

  return (
    <Tooltip label="Edit employee">
      <ActionIcon
        variant="subtle"
        color="blue"
        size="lg"
        radius="xl"
        aria-label="Edit employee"
        onClick={openEditModal}
      >
        <IconEdit size={18} />
      </ActionIcon>
    </Tooltip>
  );
}