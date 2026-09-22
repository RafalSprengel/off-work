"use client";

import {
  ActionIcon,
  Button,
  Container,
  Divider,
  Flex,
  Group,
  Paper,
  Popover,
  Stack,
  Text,
  Textarea,
  TextInput,
  Title,
} from "@mantine/core";
import { DatePicker, DatePickerProps } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { createLeaveRequest } from "@/actions/employee/leave/createLeaveRequest";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useMyLeaveRequests } from "@/hooks/useMyLeaveRequests";
import { useNonWorkingDays } from "@/hooks/useNonWorkingDays";
import "@mantine/dates/styles.css";

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  flexShrink: 0,
};

export default function NewEmployeeLeaveRequestPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const { employee, loading: employeeLoading } = useCurrentEmployee();
  const { requests: myRequests, loading: loadingMyRequests } =
    useMyLeaveRequests();
  const {
    bankHolidaysMap,
    closuresMap,
    loading: loadingNonWorking,
  } = useNonWorkingDays();

  const dataLoading = loadingMyRequests || loadingNonWorking;

  const [opened, setOpened] = useState(false);

  const myApprovedDates = useMemo(() => {
    const dates = new Set<string>();
    myRequests
      .filter((req) => req.status === "approved")
      .forEach((req) => {
        let cur = dayjs(req.startDate);
        const last = dayjs(req.endDate);
        while (cur.isBefore(last) || cur.isSame(last, "day")) {
          dates.add(cur.format("YYYY-MM-DD"));
          cur = cur.add(1, "day");
        }
      });
    return dates;
  }, [myRequests]);

  const isUnavailable = (date: Date | string) => {
    const key = dayjs(date).format("YYYY-MM-DD");
    return (
      myApprovedDates.has(key) ||
      bankHolidaysMap.has(key) ||
      closuresMap.has(key)
    );
  };

  const form = useForm({
    initialValues: {
      dateRange: [null, null] as [Date | null, Date | null],
      comment: "",
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

  const startDate = form.values.dateRange[0];
  const endDate = form.values.dateRange[1];

  const startDateStr = form.values.dateRange[0]
    ? dayjs(form.values.dateRange[0]).format("YYYY-MM-DD")
    : null;
  const endDateStr = form.values.dateRange[1]
    ? dayjs(form.values.dateRange[1]).format("YYYY-MM-DD")
    : null;
  const formattedRange =
    startDateStr && endDateStr
      ? `${startDateStr} – ${endDateStr}`
      : startDateStr
        ? startDateStr
        : "";

  const getDayCellProps: DatePickerProps<"range">["getDayProps"] = (date) => {
    const key = dayjs(date).format("YYYY-MM-DD");
    const isLeave = myApprovedDates.has(key);
    const isBankHoliday = bankHolidaysMap.has(key);
    const isClosure = closuresMap.has(key);

    const style: React.CSSProperties = {};
    if (isBankHoliday) {
      style.backgroundColor = "var(--mantine-color-green-1)";
      style.color = "var(--mantine-color-green-9)";
      style.fontWeight = 700;
      style.borderRadius = "8px";
    } else if (isClosure) {
      style.backgroundColor = "var(--mantine-color-orange-1)";
      style.color = "var(--mantine-color-orange-9)";
      style.fontWeight = 700;
      style.borderRadius = "8px";
    } else if (isLeave) {
      style.backgroundColor = "var(--mantine-color-blue-1)";
      style.color = "var(--mantine-color-blue-9)";
      style.fontWeight = 700;
      style.borderRadius = "8px";
    }

    return { style };
  };

  const renderDay: DatePickerProps<"range">["renderDay"] = (date) => {
    const dayObj = dayjs(date);
    const dayNum = dayObj.date();
    const key = dayObj.format("YYYY-MM-DD");
    const isLeave = myApprovedDates.has(key);
    const isBankHoliday = bankHolidaysMap.has(key);
    const isClosure = closuresMap.has(key);
    const isHighlighted = isLeave || isBankHoliday || isClosure;

    return (
      <Stack
        gap={2}
        align="center"
        justify="center"
        style={{ height: "100%", width: "100%" }}
      >
        <Text size="xs" lh={1} fw={isHighlighted ? 700 : 400}>
          {dayNum}
        </Text>
        <Flex gap={3} align="center" style={{ height: 6 }}>
          {isLeave && (
            <span
              style={{ ...dotStyle, background: "var(--mantine-color-blue-6)" }}
            />
          )}
          {isBankHoliday && (
            <span
              style={{
                ...dotStyle,
                background: "var(--mantine-color-green-6)",
              }}
            />
          )}
          {isClosure && (
            <span
              style={{
                ...dotStyle,
                background: "var(--mantine-color-orange-6)",
              }}
            />
          )}
        </Flex>
      </Stack>
    );
  };

  const calculateWorkingDays = (start: Date, end: Date): number => {
    let count = 0;
    let current = dayjs(start);
    const last = dayjs(end);

    while (current.isBefore(last) || current.isSame(last, "day")) {
      const dayOfWeek = current.day();
      const formattedDate = current.format("YYYY-MM-DD");
      const isNonWorking =
        bankHolidaysMap.has(formattedDate) || closuresMap.has(formattedDate);

      if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isNonWorking) {
        count++;
      }
      current = current.add(1, "day");
    }

    return count;
  };

  const daysRequested =
    startDate && endDate ? calculateWorkingDays(startDate, endDate) : 0;

  const handleSubmit = async () => {
    setLoading(true);

    const result = await createLeaveRequest({
      startDate: dayjs(startDate).format("YYYY-MM-DD"),
      endDate: dayjs(endDate).format("YYYY-MM-DD"),
      comment: form.values.comment ?? "",
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
              <TextInput
                label="Submitted By"
                description="First and last name of the person submitting the request"
                value={
                  employee ? `${employee.firstName} ${employee.lastName}` : ""
                }
                placeholder="Loading name..."
                readOnly
                disabled={employeeLoading}
              />

              <Popover
                opened={opened}
                onChange={setOpened}
                position="bottom-start"
                offset={4}
                shadow="md"
                radius="md"
                disabled={dataLoading}
              >
                <Popover.Target>
                  <TextInput
                    label="Select Holiday Dates"
                    placeholder="Pick start and end date"
                    leftSection={<IconCalendar size={18} />}
                    value={formattedRange}
                    readOnly
                    disabled={dataLoading}
                    error={form.errors.dateRange}
                    onClick={() => setOpened((o) => !o)}
                    rightSection={
                      startDateStr ? (
                        <ActionIcon
                          variant="subtle"
                          color="gray"
                          onClick={(e) => {
                            e.stopPropagation();
                            form.setFieldValue("dateRange", [null, null]);
                          }}
                          aria-label="Clear dates"
                        >
                          <IconX size={16} />
                        </ActionIcon>
                      ) : undefined
                    }
                  />
                </Popover.Target>
                <Popover.Dropdown>
                  <Stack gap="xs">
                    <DatePicker
                      type="range"
                      value={form.values.dateRange}
                      onChange={(val) => {
                        form.setFieldValue("dateRange", val as [Date | null, Date | null]);
                        if (val[0] && val[1]) {
                          setOpened(false);
                        }
                      }}
                      excludeDate={isUnavailable}
                      getDayProps={getDayCellProps}
                      renderDay={renderDay}
                      allowSingleDateInRange
                    />
                    <Divider />
                    <Group gap="sm" mt="xs" wrap="wrap">
                      <Group gap="xs" align="center">
                        <span
                          style={{
                            ...dotStyle,
                            background: "var(--mantine-color-blue-6)",
                          }}
                        />
                        <Text size="xs" c="dimmed">
                          Leave
                        </Text>
                      </Group>
                      <Group gap="xs" align="center">
                        <span
                          style={{
                            ...dotStyle,
                            background: "var(--mantine-color-green-6)",
                          }}
                        />
                        <Text size="xs" c="dimmed">
                          Bank holiday
                        </Text>
                      </Group>
                      <Group gap="xs" align="center">
                        <span
                          style={{
                            ...dotStyle,
                            background: "var(--mantine-color-orange-6)",
                          }}
                        />
                        <Text size="xs" c="dimmed">
                          Company closure
                        </Text>
                      </Group>
                    </Group>
                  </Stack>
                </Popover.Dropdown>
              </Popover>

              {daysRequested > 0 && (
                <Paper
                  p="sm"
                  radius="sm"
                  withBorder
                  bg="var(--mantine-color-gray-0)"
                >
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

              <Textarea
                label="Comment"
                placeholder="Add any additional details (optional)"
                autosize
                minRows={2}
                maxRows={4}
                {...form.getInputProps("comment")}
              />

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
