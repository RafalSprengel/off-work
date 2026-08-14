"use client";

import { Stack, TextInput } from "@mantine/core";
import { useState } from "react";

export default function GeneralSettingsPage() {
    const [companyName, setCompanyName] = useState("Company X");
    const [timeZone, setTimeZone] = useState("Europe/Warsaw");

    return (
        <Stack gap="md" style={{ maxWidth: 600 }}>
            <TextInput
                label="Company Name"
                placeholder="Enter organization name"
                value={companyName}
                onChange={(e) => setCompanyName(e.currentTarget.value)}
            />
            <TextInput
                label="Primary Timezone"
                placeholder="e.g. Europe/Warsaw"
                value={timeZone}
                onChange={(e) => setTimeZone(e.currentTarget.value)}
            />
        </Stack>
    );
}