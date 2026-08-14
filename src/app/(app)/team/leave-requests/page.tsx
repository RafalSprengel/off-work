"use client";

import { createLeaveRequestAsAdmin } from "@/actions/leaveRequestActions";
import { useEmployees } from "@/hooks/useEmployees";
import { useUkBankHolidays } from "@/hooks/useUkBankHolidays";
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
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconCalendar, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useState } from "react";
import "@mantine/dates/styles.css";

export default function NewLeaveRequestAsAdminPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);

  const { employees, loading: isLoadingEmployees } = useEmployees();
  const { bankHolidays } = useUkBankHolidays();

  const form = useForm({
    initialValues: {
      employee: "",
      dateRange: [null, null] as [Date | null, Date | null],
      completedDate: new Date(),
    },
    validate: {
      employee: (value) => (!value ? "Please select an employee" : null),
      dateRange: (value) => {
        if (!value[0] || !value[1]) {
          return "Please select both start and end dates";
        }
        return null;
      },
    },
  });

  const [startDate, endDate] = form.values.dateRange;

  const calculateDaysRequested = () => {
    if (!startDate || !endDate) return 0;
    const start = dayjs(startDate);
    const end = dayjs(endDate);
    if (end.isBefore(start, "day")) return 0;
    return end.diff(start, "day") + 1;
  };

  const daysRequested = calculateDaysRequested();

  const handleSubmit = async (values: typeof form.values) => {
    const [start, end] = values.dateRange;
    if (!start || !end) return;

    setSubmitting(true);

    const result = await createLeaveRequestAsAdmin({
      userId: values.employee,
      startDate: dayjs(start).format("YYYY-MM-DD"),
      endDate: dayjs(end).format("YYYY-MM-DD"),
    });

    setSubmitting(false);

    if (result.error) {
      notifications.show({
        title: "Error",
        message: result.error,
        color: "red",
        icon: <IconX size={16} />,
      });
    } else {
      notifications.show({
        title: "Success",
        message: "Leave request created successfully",
        color: "green",
      });
      router.push("/team/leave-requests");
    }
  };

  const selectData = employees.map((emp) => {
    const deptName = typeof emp.department === "object" ? emp.department?.name : emp.department;
    return {
      value: emp._id,
      label: `${emp.firstName} ${emp.lastName}`,
      department: deptName || "No department",
      email: emp.email,
    };
  });

  return (
    <Container size="sm" py="lg" px={{ base: "xs", sm: "md" }}>
      <Stack gap="lg">
        <Title order={2}>Create Leave Request (Admin)</Title>
        <Paper p={{ base: "md", sm: "xl" }} radius="md" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Select
                label="Employee"
                placeholder={isLoadingEmployees ? "Loading employees..." : "Select employee"}
                data={selectData}
                searchable
                disabled={isLoadingEmployees || submitting}
                nothingFoundMessage="No employees found"
                {...form.getInputProps("employee")}
                renderOption={({ option }) => {
                  const emp = selectData.find((e) => e.value === option.value);
                  return (
                    <div>
                      <Text size="sm" fw={600}>
                        {emp?.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        🏢 {emp?.department}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ✉️ {emp?.email}
                      </Text>
                    </div>
                  );
                }}
              />

              <DatePickerInput
                type="range"
                label="Holiday Date Range"
                placeholder="Pick start and end date"
                leftSection={<IconCalendar size={18} />}
                valueFormat="YYYY-MM-DD"
                clearable
                disabled={submitting}
                getDayProps={(date) => {
                  const formattedDate = dayjs(date).format("YYYY-MM-DD");
                  const isBankHoliday = bankHolidays.includes(formattedDate);

                  if (isBankHoliday) {
                    return {
                      style: {
                        backgroundColor: "var(--mantine-color-green-1)",
                        color: "var(--mantine-color-green-9)",
                        fontWeight: "bold",
                        borderRadius: "8px",
                      },
                    };
                  }

                  return {};
                }}
                renderDay={(date) => {
                  const dayObj = dayjs(date);
                  const dayNum = dayObj.date();
                  const formattedDate = dayObj.format("YYYY-MM-DD");
                  const isBankHoliday = bankHolidays.includes(formattedDate);

                  return (
                    <Flex direction="column" align="center" justify="center" style={{ height: "100%", width: "100%" }}>
                      <Text size="xs" lh={1} fw={isBankHoliday ? 700 : 400}>
                        {dayNum}
                      </Text>
                      {isBankHoliday && (
                        <Text size="7px" lh={1.1} ta="center" mt={2} style={{ whiteSpace: "pre-line" }}>
                          Bank{"\n"}Holiday
                        </Text>
                      )}
                    </Flex>
                  );
                }}
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

              <Flex justify="flex-end" mt="md" gap="sm">
                <Button
                  variant="light"
                  onClick={() => router.back()}
                  disabled={submitting}
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  color="blue"
                  loading={submitting}
                  w={{ base: "100%", sm: "auto" }}
                >
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