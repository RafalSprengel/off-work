"use client";

import {
  Button,
  Container,
  Divider,
  Flex,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import "@mantine/dates/styles.css";

const usersData = [
  { value: "self", label: "For myself" },
  {
    value: "1",
    label: "Adam Pietrzak",
    department: "Kitchen",
    email: "adam@demo.com",
  },
  {
    value: "2",
    label: "Artur Pawlak",
    department: "Floor",
    email: "artur@demo.com",
  },
];

export default function NewLeaveRequestPage() {
  const form = useForm({
    initialValues: {
      employee: "self",
      startDate: null as Date | null,
      endDate: null as Date | null,
      daysRequested: 0,
      completedDate: new Date(),
    },
  });

  const calculateDays = (
    start: Date | string | null,
    end: Date | string | null,
  ): number => {
    if (!start || !end) return 0;

    let currentDate = dayjs(start).startOf("day");
    const endDate = dayjs(end).startOf("day");

    if (!currentDate.isValid() || !endDate.isValid()) {
      return 0;
    }

    if (currentDate.isAfter(endDate)) {
      return 0;
    }

    let workingDays = 0;

    while (
      currentDate.isBefore(endDate) ||
      currentDate.isSame(endDate, "day")
    ) {
      const dayOfWeek = currentDate.day();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
      currentDate = currentDate.add(1, "day");
    }

    return workingDays;
  };

  const handleStartDateChange = (date: Date | null) => {
    form.setFieldValue("startDate", date);
    const days = calculateDays(date, form.values.endDate);
    form.setFieldValue("daysRequested", days);
  };

  const handleEndDateChange = (date: Date | null) => {
    form.setFieldValue("endDate", date);
    const days = calculateDays(form.values.startDate, date);
    form.setFieldValue("daysRequested", days);
  };

  const handleSubmit = (_values: typeof form.values) => {
    // Submit handling logic
  };

  return (
    <Container size="sm" py="lg">
      <Stack gap="lg">
        <Title order={2}>Create new request</Title>
        <Paper p="xl" radius="md" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Select
                label="Employee"
                placeholder="Select employee"
                data={usersData}
                searchable
                nothingFoundMessage="Nothing found..."
                {...form.getInputProps("employee")}
                renderOption={({ option }) => {
                  const user = usersData.find((u) => u.value === option.value);
                  if (option.value === "self") {
                    return (
                      <Text size="sm" fw={500}>
                        For myself
                      </Text>
                    );
                  }
                  return (
                    <div>
                      <Text size="sm" fw={600}>
                        {user?.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        🏢 {user?.department}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ✉️ {user?.email}
                      </Text>
                    </div>
                  );
                }}
              />

              <Flex direction={{ base: "column", sm: "row" }} gap="md">
                <DateInput
                  label="1st Day of Holiday"
                  placeholder="Select start date"
                  leftSection={<IconCalendar size={18} />}
                  valueFormat="YYYY-MM-DD"
                  value={form.values.startDate}
                  onChange={handleStartDateChange}
                  clearable
                  style={{ flex: 1 }}
                />

                <DateInput
                  label="Last Day of Holiday"
                  placeholder="Select end date"
                  leftSection={<IconCalendar size={18} />}
                  valueFormat="YYYY-MM-DD"
                  minDate={form.values.startDate || undefined}
                  value={form.values.endDate}
                  onChange={handleEndDateChange}
                  clearable
                  style={{ flex: 1 }}
                />
              </Flex>

              <Divider my="xs" />

              <Flex
                direction={{ base: "column", xs: "row" }}
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                gap="sm"
              >
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    No of Days Requested
                  </Text>
                  <Text size="sm" fw={600}>
                    {form.values.daysRequested}{" "}
                    {form.values.daysRequested === 1 ? "day" : "days"}
                  </Text>
                </div>

                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Date Completed
                  </Text>
                  <Flex gap={6} align="center">
                    <IconCalendar size={16} style={{ opacity: 0.7 }} />
                    <Text size="sm" fw={500}>
                      {dayjs(form.values.completedDate).format("YYYY-MM-DD")}
                    </Text>
                  </Flex>
                </div>
              </Flex>

              <Flex justify="flex-end" mt="md">
                <Button type="submit" color="blue">
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
