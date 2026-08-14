"use client";

import { createLeaveRequest } from "@/actions/leaveRequestActions";
import {
    Button,
    Container,
    Divider,
    Flex,
    Paper,
    Stack,
    Text,
    Title,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "@mantine/dates/styles.css";

export default function NewEmployeeLeaveRequestPage() {
    const router = useRouter();
    const [loading, setLoading] = useState(false);

    const form = useForm({
        initialValues: {
            dateRange: [null, null] as [Date | null, Date | null],
        },
        validate: {
            dateRange: (value) => {
                if (!value[0] || !value[1]) {
                    return "Please select both start and end dates";
                }
                return null;
            },
        },
    });

    const getSelectedDates = (start: Date, end: Date): string[] => {
        const dates: string[] = [];
        let current = dayjs(start);
        const last = dayjs(end);

        while (current.isBefore(last) || current.isSame(last, "day")) {
            dates.push(current.format("YYYY-MM-DD"));
            current = current.add(1, "day");
        }

        return dates;
    };

    const startDate = form.values.dateRange[0];
    const endDate = form.values.dateRange[1];

    const datesList =
        startDate && endDate ? getSelectedDates(startDate, endDate) : [];
    const daysRequested = datesList.length;

    const handleSubmit = async () => {
        if (!startDate || !endDate) return;

        setLoading(true);

        const result = await createLeaveRequest({
            dates: datesList,
            daysRequested,
        });

        setLoading(false);

        if (result?.error) {
            form.setFieldError("dateRange", result.error);
        } else {
            router.push("/me/leave-requests");
        }
    };

    return (
        <Container size="sm" py="lg" px={{ base: "xs", sm: "md" }}>
            <Stack gap="lg">
                <Title order={2}>New Leave Request</Title>
                <Paper p={{ base: "md", sm: "xl" }} radius="md" withBorder>
                    <form onSubmit={form.onSubmit(handleSubmit)}>
                        <Stack gap="md">
                            <DatePickerInput
                                type="range"
                                label="Select Holiday Dates"
                                placeholder="Pick start and end date"
                                leftSection={<IconCalendar size={18} />}
                                valueFormat="YYYY-MM-DD"
                                clearable
                                {...form.getInputProps("dateRange")}
                            />

                            {daysRequested > 0 && (
                                <Paper p="sm" radius="sm" withBorder bg="var(--mantine-color-gray-0)">
                                    <Flex justify="space-between" align="center">
                                        <Text size="sm" fw={500}>
                                            Total Days Requested:
                                        </Text>
                                        <Text size="sm" fw={700} c="blue">
                                            {daysRequested} {daysRequested === 1 ? "day" : "days"}
                                        </Text>
                                    </Flex>
                                </Paper>
                            )}

                            <Divider my="xs" />

                            <Flex
                                direction={{ base: "column", xs: "row" }}
                                justify="space-between"
                                align={{ base: "flex-start", sm: "center" }}
                                gap="sm"
                            >
                                <div>
                                    <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                                        Date Submitted
                                    </Text>
                                    <Flex gap={6} align="center">
                                        <IconCalendar size={16} style={{ opacity: 0.7 }} />
                                        <Text size="sm" fw={500}>
                                            {dayjs().format("YYYY-MM-DD")}
                                        </Text>
                                    </Flex>
                                </div>
                            </Flex>

                            <Flex justify="flex-end" mt="md" gap="sm">
                                <Button
                                    variant="light"
                                    onClick={() => router.back()}
                                    disabled={loading}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" loading={loading}>
                                    Submit Request
                                </Button>
                            </Flex>
                        </Stack>
                    </form>
                </Paper>
            </Stack>
        </Container>
    );
}