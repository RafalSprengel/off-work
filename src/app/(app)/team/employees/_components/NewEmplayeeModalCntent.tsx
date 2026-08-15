'use client'

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import { Stack, Button, TextInput, Select, NumberInput, Group, Flex } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { getDepartments } from "@/actions/manager/employees/getDepartments";
import { getRoles } from "@/actions/public/roles/getRoles";
import { getManagers } from "@/actions/manager/employees/getManagers";
import type { IManager } from "@/types/employees";
import { createEmployee } from "@/actions/admin/employees/createEmployee";
import { IDepartment } from "@/types/department";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";

export default function NewEmployeeModalContent() {
    const router = useRouter();
    const [departments, setDepartments] = useState<IDepartment[]>([]);
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false);
    const [roles, setRoles] = useState<string[]>([]);
    const [isLoadingRoles, setIsLoadingRoles] = useState(false);
    const [managersList, setManagersList] = useState<IManager[]>([]);
    const [isLoadingManagers, setIsLoadingManagers] = useState(false);

    const form = useForm({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            role: "Employee",
            department: "",
            managerId: "",
            holidayAllowance: 24,
            employmentDate: null
        },
        validate: {
            firstName: (value) => (value ? null : "First name is required"),
            lastName: (value) => (value ? null : "Last name is required"),
            email: (value) => (value ? null : "Email is required"),
            role: (value) => (value ? null : "Role is required"),
            department: (value) => (value ? null : "Department is required"),
            holidayAllowance: (value) => (value ? null : "Holiday allowance is required"),
            employmentDate: (value) => (value ? null : "Employment date is required")
        }
    });

    async function handleSubmit() {
        const { hasErrors } = form.validate();

        if (hasErrors) {
            return;
        }

        try {
            const { success, error, errorCode } = await createEmployee({
                firstName: form.values.firstName,
                lastName: form.values.lastName,
                email: form.values.email,
                role: form.values.role,
                department: form.values.department,
                managerId: form.values.managerId || undefined,
                holidayAllowance: form.values.holidayAllowance,
                employmentDate: form.values.employmentDate as unknown as string,
            });

            if (success) {
                notifications.show({
                    title: "Success",
                    message: "Employee created successfully",
                    color: "green",
                });
                modals.close("new-employee-modal");
                router.refresh();
            } else if (errorCode === "DUPLICATE_EMAIL") {
                form.setFieldError("email", error || "An employee with this email already exists.");
            } else {
                notifications.show({
                    title: "Error",
                    message: error || "Failed to create employee",
                    color: "red",
                    icon: <IconX />
                });
            }
        } catch (err) {
            console.error("Unexpected error in handleSubmit:", err);

            notifications.show({
                title: "Error",
                message: err instanceof Error ? err.message : "An unexpected error occurred",
                color: "red",
                icon: <IconX />
            });
        }
    }

    function handleCancel() {
        modals.close("new-employee-modal");
    }

    useEffect(() => {
        async function loadDepatments() {
            setIsLoadingDepartments(true);
            const { success, data, error } = await getDepartments();
            if (success) {
                setDepartments(data);
            } else {
                notifications.show({
                    title: "Error",
                    message: error,
                    color: "red",
                    icon: <IconX />
                });
            }
            setIsLoadingDepartments(false);
        }
        loadDepatments();

        async function loadRoles() {
            setIsLoadingRoles(true);
            const { success, data, error } = await getRoles();
            if (success) {
                setRoles(data);
            } else {
                notifications.show({
                    title: "Error",
                    message: error,
                    color: "red",
                    icon: <IconX />
                });
            }
            setIsLoadingRoles(false);
        }
        loadRoles();

        async function loadManagers() {
            setIsLoadingManagers(true);
            const { success, data, error } = await getManagers();
            if (success && data) {
                setManagersList(data);
            } else {
                notifications.show({
                    title: "Error",
                    message: error,
                    color: "red",
                    icon: <IconX />
                });
            }
            setIsLoadingManagers(false);
        }
        loadManagers();
    }, []);

    return (
        <Stack gap="md">
            <Flex direction={{ base: 'column', sm: 'row' }} gap="md">
                <TextInput
                    label="First name"
                    placeholder="e.g. John"
                    {...form.getInputProps("firstName")}
                    flex={1}
                />
                <TextInput
                    label="Last name"
                    placeholder="e.g. Doe"
                    {...form.getInputProps("lastName")}
                    flex={1}
                />
            </Flex>

            <Flex direction={{ base: 'column', sm: 'row' }} gap="md">
                <TextInput
                    label="Email"
                    placeholder="e.g. john.doe@mail.com"
                    {...form.getInputProps("email")}
                    flex={1}
                />
                <Select
                    label="Role"
                    placeholder={
                        isLoadingRoles ? "Loading roles..." :
                            roles.length > 0 ? "Select role" :
                                "No roles found"
                    }
                    data={roles}
                    loading={isLoadingRoles}
                    disabled={isLoadingRoles}
                    {...form.getInputProps("role")}
                    flex={1}
                />
            </Flex>

            <Flex direction={{ base: 'column', sm: 'row' }} gap="md">
                <Select
                    label="Department"
                    placeholder={isLoadingDepartments ? "Loading departments..." :
                        departments.length > 0 ? "Select department" :
                            "No departments found"
                    }
                    loading={isLoadingDepartments}
                    disabled={isLoadingDepartments}
                    data={departments.map((department) => {
                        return {
                            value: department._id,
                            label: department.name
                        };
                    })}
                    {...form.getInputProps("department")}
                    flex={1}
                />
                <Select
                    label="Manager"
                    placeholder={
                        isLoadingManagers ? "Loading managers..." :
                            managersList.length > 0 ? "Select manager" :
                                "No managers found"
                    }
                    loading={isLoadingManagers}
                    disabled={isLoadingManagers || form.values.role === "Manager"}
                    data={managersList.map((manager) => {
                        return {
                            value: manager._id,
                            label: manager.firstName + " " + manager.lastName
                        };
                    })}
                    {...form.getInputProps("managerId")}
                    flex={1}
                    clearable
                />
            </Flex>

            <Flex direction={{ base: 'column', sm: 'row' }} gap="md">
                <DatePickerInput
                    label="Employment Date / Start Date"
                    placeholder="Select employment date"
                    {...form.getInputProps("employmentDate")}
                    flex={1}
                />
                <NumberInput
                    label="Proposed Annual Leave"
                    placeholder="e.g. 20"
                    flex={1}
                    {...form.getInputProps("holidayAllowance")}
                />
            </Flex>

            <Group grow mt="md">
                <Button onClick={handleCancel} variant="light">Cancel</Button>
                <Button onClick={handleSubmit}>Create</Button>
            </Group>
        </Stack>
    );
}