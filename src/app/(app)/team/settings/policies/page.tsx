"use client";

import { Divider, NumberInput, Stack, Switch } from "@mantine/core";
import { useState } from "react";

export default function LeavePoliciesPage() {
    const [annualLeaveDays, setAnnualLeaveDays] = useState<number | string>(26);
    const [autoApproveSick, setAutoApproveSick] = useState(false);
    const [carryOverDays, setCarryOverDays] = useState(true);

    return (
        <Stack gap="md" style={{ maxWidth: 600 }}>
            <NumberInput
                label="Default Annual Leave Allowance (Days)"
                description="Base allowance given to full-time employees annually"
                value={annualLeaveDays}
                onChange={setAnnualLeaveDays}
                min={0}
                max={365}
            />
            <Divider my="xs" />
            <Switch
                label="Allow Carrying Over Unused Days"
                description="Employees can transfer unused leave to the next year"
                checked={carryOverDays}
                onChange={(e) => setCarryOverDays(e.currentTarget.checked)}
            />
            <Switch
                label="Auto-Approve Sick Leave Requests"
                description="Requests marked as sick leave will bypass manager approval"
                checked={autoApproveSick}
                onChange={(e) => setAutoApproveSick(e.currentTarget.checked)}
            />
        </Stack>
    );
}