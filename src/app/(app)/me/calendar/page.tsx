"use client";

import { Badge, Grid, Group, Paper, Stack, Text, Title } from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { useState } from "react";

export default function EmployeeCalendarPage() {
    const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());

    return (
        <Stack gap="lg">
            <Title order={2}>My Schedule & Calendar</Title>

            <Grid gutter="md" align="start">
                <Grid.Col span={{ base: 12, md: "auto" }}>
                    <Paper
                        p="md"
                        radius="md"
                        withBorder
                        bg="var(--mantine-color-body)"
                        display="flex"
                        style={{ justifyContent: "center" }}
                    >
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            size="md"
                        />
                    </Paper>
                </Grid.Col>

                <Grid.Col span={{ base: 12, md: "flex-1" }}>
                    <Paper
                        p="md"
                        radius="md"
                        withBorder
                        bg="var(--mantine-color-body)"
                        style={{ minHeight: 350 }}
                    >
                        <Title order={4} mb="md">
                            Events & Requests
                        </Title>

                        <Stack gap="xs">
                            <Paper
                                p="sm"
                                radius="sm"
                                withBorder
                                bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                            >
                                <Group justify="space-between" mb="xs">
                                    <Text fw={600} size="sm">
                                        Annual Leave
                                    </Text>
                                    <Badge color="green">Approved</Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    Aug 20, 2026 - Aug 27, 2026
                                </Text>
                            </Paper>

                            <Paper
                                p="sm"
                                radius="sm"
                                withBorder
                                bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                            >
                                <Group justify="space-between" mb="xs">
                                    <Text fw={600} size="sm">
                                        Sick Leave
                                    </Text>
                                    <Badge color="yellow">Pending</Badge>
                                </Group>
                                <Text size="xs" c="dimmed">
                                    Sep 01, 2026 - Sep 02, 2026
                                </Text>
                            </Paper>
                        </Stack>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    );
}