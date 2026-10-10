"use client";

import { useEffect, useState, useTransition } from "react";
import {
    Button,
    Divider,
    Group,
    Loader,
    NumberInput,
    SimpleGrid,
    Stack,
    Switch,
    Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";

import { getOrgSettings } from "@/actions/admin/settings/getOrgSettings";
import { updateOrgSettings } from "@/actions/admin/settings/updateOrgSettings";
import type { IOrgSettings } from "@/types/orgSettings";
import {
    DEFAULT_LEAVE_ALLOWANCE_DAYS,
    LEAVE_ALLOWANCE_TYPES,
    type LeaveAllowanceType,
} from "@/constants/leaveAllowanceTypes";

type FormValues = {
    defaultAllowances: Record<string, number | string>;
    allowCarryOver: boolean;
    maxCarryOverDays: number | string;
    autoApproveSickLeave: boolean;
};

const ALLOWANCE_LABELS: Record<LeaveAllowanceType, string> = {
    annual: "Default Annual Leave Allowance (Days)",
    unpaid: "Default Unpaid Leave Allowance (Days)",
    sick: "Default Sick Leave Allowance (Days)",
    bereavement: "Default Bereavement Allowance (Days)",
};

const ALLOWANCE_DESCRIPTIONS: Record<LeaveAllowanceType, string> = {
    annual: "Base allowance given to full-time employees annually",
    unpaid: "Default days pre-filled when adding a new employee",
    sick: "Default days pre-filled when adding a new employee",
    bereavement: "Default days pre-filled when adding a new employee",
};

/** Reads stored allowances, falling back to the effective defaults. */
function toAllowanceFormValues(settings: IOrgSettings): Record<string, number> {
    const stored = settings.defaultAllowances ?? {};
    return Object.fromEntries(
        LEAVE_ALLOWANCE_TYPES.map((type) => [
            type,
            stored[type] ??
                (type === "annual"
                    ? settings.defaultAnnualLeaveDays
                    : DEFAULT_LEAVE_ALLOWANCE_DAYS[type]),
        ]),
    );
}

function validateAllowanceDays(value: number | string): string | null {
    const n = Number(value);
    return Number.isNaN(n) || n < 0 || n > 365 ? "Must be between 0 and 365" : null;
}

export default function LeavePoliciesPage() {
    const [loadingSettings, setLoadingSettings] = useState(true);
    const [isPending, startTransition] = useTransition();

    const form = useForm<FormValues>({
        initialValues: {
            defaultAllowances: Object.fromEntries(
                LEAVE_ALLOWANCE_TYPES.map((t) => [t, DEFAULT_LEAVE_ALLOWANCE_DAYS[t]]),
            ),
            allowCarryOver: true,
            maxCarryOverDays: 5,
            autoApproveSickLeave: false,
        },
        validate: {
            defaultAllowances: {
                annual: validateAllowanceDays,
                unpaid: validateAllowanceDays,
                sick: validateAllowanceDays,
                bereavement: validateAllowanceDays,
            },
            maxCarryOverDays: (v) =>
                Number(v) < 0 || Number(v) > 365 ? "Must be between 0 and 365" : null,
        },
    });

    useEffect(() => {
        (async () => {
            const res = await getOrgSettings();
            if (res.success) {
                form.setValues({
                    defaultAllowances: toAllowanceFormValues(res.data),
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
            const defaultAllowances = Object.fromEntries(
                LEAVE_ALLOWANCE_TYPES.map((type) => [
                    type,
                    Number(values.defaultAllowances[type]) || 0,
                ]),
            );

            const res = await updateOrgSettings({
                defaultAllowances,
                defaultAnnualLeaveDays: Number(values.defaultAllowances.annual) || 0,
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
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
                    {LEAVE_ALLOWANCE_TYPES.map((type) => (
                        <NumberInput
                            key={type}
                            label={ALLOWANCE_LABELS[type]}
                            description={ALLOWANCE_DESCRIPTIONS[type]}
                            min={0}
                            max={365}
                            decimalScale={2}
                            {...form.getInputProps(`defaultAllowances.${type}`)}
                        />
                    ))}
                </SimpleGrid>

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