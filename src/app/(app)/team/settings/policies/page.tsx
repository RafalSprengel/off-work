"use client";

import { useEffect, useState, useTransition } from "react";
import { Button, Divider, Group, Loader, NumberInput, Stack, Switch, Text } from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { getOrgSettings } from "@/actions/admin/settings/getOrgSettings";
import { updateOrgSettings } from "@/actions/admin/settings/updateOrgSettings";

type FormValues = {
    defaultAnnualLeaveDays: number | string;
    allowCarryOver: boolean;
    maxCarryOverDays: number | string;
    autoApproveSickLeave: boolean;
};

export default function LeavePoliciesPage() {
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        initialValues: {
            defaultAnnualLeaveDays: 26,
            allowCarryOver: true,
            maxCarryOverDays: 5,
            autoApproveSickLeave: false,
        },
        validate: {
            defaultAnnualLeaveDays: (v) =>
                Number(v) < 0 || Number(v) > 365 ? "Must be between 0 and 365" : null,
            maxCarryOverDays: (v) =>
                Number(v) < 0 || Number(v) > 365 ? "Must be between 0 and 365" : null,
        },
    });

    useEffect(() => {
        (async () => {
            const res = await getOrgSettings();
            if (res.success) {
                form.setValues({
                    defaultAnnualLeaveDays: res.data.defaultAnnualLeaveDays,
                    allowCarryOver: res.data.allowCarryOver,
                    maxCarryOverDays: res.data.maxCarryOverDays,
                    autoApproveSickLeave: res.data.autoApproveSickLeave,
                });
            } else {
                notifications.show({
                    color: "red",
                    title: "Failed to load settings",
                    message: res.error,
                });
            }
            setLoadingSettings(false);
        })();
    }, []);

    const handleSubmit = (values: FormValues) => {
        startTransition(async () => {
            const res = await updateOrgSettings({
                defaultAnnualLeaveDays: Number(values.defaultAnnualLeaveDays),
                allowCarryOver: values.allowCarryOver,
                maxCarryOverDays: Number(values.maxCarryOverDays),
                autoApproveSickLeave: values.autoApproveSickLeave,
            });

            if (res.success) {
                notifications.show({
                    color: "green",
                    title: "Policies saved",
                    message: "Leave policies updated successfully.",
                });
            } else {
                notifications.show({
                    color: "red",
                    title: "Save failed",
                    message: res.error,
                });
            }
        });
    };

    if (loadingSettings) {
        return (
            <Group justify="center" py="xl">
                <Loader size="sm" />
            </Group>
        );
    }

    return (
        <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md" style={{ maxWidth: 600 }}>
                <NumberInput
                    label="Default Annual Leave Allowance (Days)"
                    description="Base allowance given to full-time employees annually"
                    min={0}
                    max={365}
                    {...form.getInputProps("defaultAnnualLeaveDays")}
                />

                <Divider my="xs" />

                <Switch
                    label="Allow Carrying Over Unused Days"
                    description="Employees can transfer unused leave to the next year"
                    checked={form.values.allowCarryOver}
                    onChange={(e) => form.setFieldValue("allowCarryOver", e.currentTarget.checked)}
                />

                {form.values.allowCarryOver && (
                    <NumberInput
                        label="Maximum Carry-Over Days"
                        description="Maximum number of days that can be carried over to the next year"
                        min={0}
                        max={365}
                        pl="md"
                        styles={{ root: { borderLeft: "2px solid var(--mantine-color-blue-4)" } }}
                        {...form.getInputProps("maxCarryOverDays")}
                    />
                )}

                <Switch
                    label="Auto-Approve Sick Leave Requests"
                    description="Requests marked as sick leave will bypass manager approval"
                    checked={form.values.autoApproveSickLeave}
                    onChange={(e) =>
                        form.setFieldValue("autoApproveSickLeave", e.currentTarget.checked)
                    }
                />

                <Group justify="flex-end" mt="xs">
                    <Button type="submit" loading={isPending}>
                        Save Changes
                    </Button>
                </Group>
            </Stack>
        </form>
    );
}