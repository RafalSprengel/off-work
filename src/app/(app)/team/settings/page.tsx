"use client";

import {
    ActionIcon,
    Button,
    Card,
    Divider,
    Group,
    NumberInput,
    Paper,
    Stack,
    Switch,
    Tabs,
    Text,
    TextInput,
    Title,
} from "@mantine/core";
import {
    IconBuilding,
    IconCalendarOff,
    IconCheck,
    IconPlug,
    IconSettings,
    IconTrash,
} from "@tabler/icons-react";
import { useState } from "react";

export default function TeamSettingsPage() {
    const [companyName, setCompanyName] = useState("Company X");
    const [timeZone, setTimeZone] = useState("Europe/Warsaw");
    const [annualLeaveDays, setAnnualLeaveDays] = useState<number | string>(26);
    const [autoApproveSick, setAutoApproveSick] = useState(false);
    const [carryOverDays, setCarryOverDays] = useState(true);

    const [holidays, setHolidays] = useState([
        { id: "1", name: "New Year's Day", date: "2026-01-01" },
        { id: "2", name: "Labor Day", date: "2026-05-01" },
        { id: "3", name: "Constitution Day", date: "2026-05-03" },
    ]);

    const removeHoliday = (id: string) => {
        setHolidays((prev) => prev.filter((item) => item.id !== id));
    };

    return (
        <Stack gap="lg">
            <Group justify="space-between" align="flex-start" wrap="wrap" gap="md">
                <div style={{ flex: "1 1 300px" }}>
                    <Title order={2} size="h3">
                        Team & Organization Settings
                    </Title>
                    <Text size="sm" c="dimmed">
                        Manage company preferences, leave policies, and system integrations
                    </Text>
                </div>
                <Button
                    leftSection={<IconCheck size={16} />}
                    color="green"
                    fullWidth={{ base: true, sm: false }}
                >
                    Save Changes
                </Button>
            </Group>

            <Paper
                p={{ base: "sm", sm: "md" }}
                radius="md"
                withBorder
                bg="var(--mantine-color-body)"
            >
                <Tabs defaultValue="general">
                    <Tabs.List
                        mb="lg"
                        style={{
                            flexWrap: "nowrap",
                            overflowX: "auto",
                            scrollbarWidth: "none",
                        }}
                    >
                        <Tabs.Tab
                            value="general"
                            leftSection={<IconBuilding size={16} />}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            General
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="policies"
                            leftSection={<IconSettings size={16} />}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            Leave Policies
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="holidays"
                            leftSection={<IconCalendarOff size={16} />}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            Public Holidays
                        </Tabs.Tab>
                        <Tabs.Tab
                            value="integrations"
                            leftSection={<IconPlug size={16} />}
                            style={{ whiteSpace: "nowrap" }}
                        >
                            Integrations
                        </Tabs.Tab>
                    </Tabs.List>

                    <Tabs.Panel value="general">
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
                    </Tabs.Panel>

                    <Tabs.Panel value="policies">
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
                    </Tabs.Panel>

                    <Tabs.Panel value="holidays">
                        <Stack gap="md" style={{ maxWidth: 600 }}>
                            <Group justify="space-between" align="center">
                                <Text size="sm" fw={500}>
                                    Configured Bank Holidays (2026)
                                </Text>
                                <Button size="xs" variant="outline">
                                    + Add Holiday
                                </Button>
                            </Group>

                            <Stack gap="xs">
                                {holidays.map((h) => (
                                    <Card
                                        key={h.id}
                                        p="xs"
                                        radius="sm"
                                        withBorder
                                        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                                    >
                                        <Group justify="space-between">
                                            <div>
                                                <Text size="sm" fw={600}>
                                                    {h.name}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {h.date}
                                                </Text>
                                            </div>
                                            <ActionIcon
                                                color="red"
                                                variant="subtle"
                                                onClick={() => removeHoliday(h.id)}
                                            >
                                                <IconTrash size={16} />
                                            </ActionIcon>
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        </Stack>
                    </Tabs.Panel>

                    <Tabs.Panel value="integrations">
                        <Stack gap="md" style={{ maxWidth: 600 }}>
                            <Card p="md" radius="sm" withBorder>
                                <Group justify="space-between" align="center">
                                    <div>
                                        <Text size="sm" fw={600}>
                                            Google Calendar Sync
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            Sync approved absences directly with team Google calendars
                                        </Text>
                                    </div>
                                    <Button size="xs" variant="light">
                                        Connect
                                    </Button>
                                </Group>
                            </Card>

                            <Card p="md" radius="sm" withBorder>
                                <Group justify="space-between" align="center">
                                    <div>
                                        <Text size="sm" fw={600}>
                                            Slack Notifications
                                        </Text>
                                        <Text size="xs" c="dimmed">
                                            Send daily summary of absent team members to a Slack channel
                                        </Text>
                                    </div>
                                    <Button size="xs" variant="light">
                                        Configure
                                    </Button>
                                </Group>
                            </Card>
                        </Stack>
                    </Tabs.Panel>
                </Tabs>
            </Paper>
        </Stack>
    );
}