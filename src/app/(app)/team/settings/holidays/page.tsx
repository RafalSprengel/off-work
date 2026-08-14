"use client";

import { ActionIcon, Button, Card, Group, Stack, Text } from "@mantine/core";
import { IconTrash } from "@tabler/icons-react";
import { useState } from "react";

export default function PublicHolidaysPage() {
    const [holidays, setHolidays] = useState([
        { id: "1", name: "New Year's Day", date: "2026-01-01" },
        { id: "2", name: "Labor Day", date: "2026-05-01" },
        { id: "3", name: "Constitution Day", date: "2026-05-03" },
    ]);

    const removeHoliday = (id: string) => {
        setHolidays((prev) => prev.filter((item) => item.id !== id));
    };

    return (
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
    );
}