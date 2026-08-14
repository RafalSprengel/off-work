"use client";

import { Button, Card, Group, Stack, Text } from "@mantine/core";

export default function IntegrationsPage() {
    return (
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
    );
}