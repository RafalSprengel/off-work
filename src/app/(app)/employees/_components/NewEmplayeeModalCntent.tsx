'use client'

import { useState, useEffect } from "react";
import { useForm } from "@mantine/form";
import { Stack, Button, TextInput, Select, NumberInput, Group, Flex, Divider } from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { getDepartments } from "@/actions/departmentsActions";
import { getRoles } from "@/actions/rolesActions";
import { IDepartment } from "@/types/department";
import { notifications } from "@mantine/notifications"
import { IconX } from "@tabler/icons-react"

export default function NewEmployeeModalContent() {
    const [departments, setDepartments] = useState<IDepartment[]>([])
    const [isLoadingDepartments, setIsLoadingDepartments] = useState(false)
    const [roles, setRoles] = useState<string[]>([])
    const [isLoadingRoles, setIsLoadingRoles] = useState(false)

    const form = useForm({
        initialValues: {
            firstName: "",
            lastName: "",
            email: "",
            role: "",
            department: "",
            proposedAnnualLeave: "24",
            employmentDate: ""
        },
        validate: {
            firstName: (value) => (value ? null : "First name is required"),
            lastName: (value) => (value ? null : "Last name is required"),
            email: (value) => (value ? null : "Email is required"),
            role: (value) => (value ? null : "Role is required"),
            department: (value) => (value ? null : "Department is required"),
            proposedAnnualLeave: (value) => (value ? null : "Proposed annual leave is required"),
            employmentDate: (value) => (value ? null : "Employment date is required")
        }
    })

    function handleSubmit() {
        const { hasErrors } = form.validate()

        if (hasErrors) {
            return
        }

        console.log(form.values)
    }

    function handleCancel() {
        modals.close("new-employee-modal")
    }

    useEffect(() => {
        async function loadDepatments() {
            setIsLoadingDepartments(true)
            const { success, data, error } = await getDepartments()
            if (success) {
                setDepartments(data)
            } else {
                notifications.show({
                    title: "Error",
                    message: error,
                    color: "red",
                    icon: <IconX />
                })
            }
            setIsLoadingDepartments(false)
        };
        loadDepatments();

        async function loadRoles() {
            setIsLoadingRoles(true)
            const { success, data, error } = await getRoles()
            if (success) {
                setRoles(data)
            } else {
                notifications.show({
                    title: "Error",
                    message: error,
                    color: "red",
                    icon: <IconX />
                })
            }
            setIsLoadingRoles(false)
        }
        loadRoles();
    }, [])

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
                    placeholder={isLoadingRoles ? "Loading roles..." : "Select role"}
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
                    placeholder={isLoadingDepartments ? "Loading departments..." : "Select department"}
                    loading={isLoadingDepartments}
                    disabled={isLoadingDepartments}
                    data={departments.map((department) => {
                        return {
                            value: department._id,
                            label: department.name
                        }
                    })}
                    {...form.getInputProps("department")}
                    flex={1}
                />
                <NumberInput
                    label="Proposed Annual Leave"
                    placeholder="e.g. 20"
                    flex={1}
                    {...form.getInputProps("proposedAnnualLeave")}
                />
            </Flex>

            <Flex direction={{ base: 'column', sm: 'row' }} gap="md">
                <DatePickerInput
                    label="Employment Date / Start Date"
                    placeholder="Select employment date"
                    {...form.getInputProps("employmentDate")}
                    flex={1}
                />
                <div style={{ flex: 1 }} />
            </Flex>

            <Group grow mt="md">
                <Button onClick={handleCancel} variant="light">Cancel</Button>
                <Button onClick={handleSubmit}>Create</Button>
            </Group>
        </Stack>
    );
}