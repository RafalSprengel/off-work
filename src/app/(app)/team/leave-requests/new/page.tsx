"use client";

import { createLeaveRequest } from "@/actions/admin/leave/createLeaveRequest";
import { useEmployees } from "@/hooks/useEmployees";
import { useNonWorkingDays } from "@/hooks/useNonWorkingDays";
import {
  Alert,
  Button,
  Container,
  Divider,
  Flex,
  Paper,
  Select,
  Stack,
  Text,
  Title,
  Checkbox,
  Group,
} from "@mantine/core";
import { DatePickerInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertTriangle, IconCalendar, IconX } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { countWorkingDays } from "@/utils/workingDays";
import { formatDateList } from "@/utils/formatDateList";
import {
  LEAVE_REQUEST_TYPES,
  getLeaveTypeLabel,
  type LeaveRequestType,
} from "@/constants/leaveTypes";
import "@mantine/dates/styles.css";

export default function NewLeaveRequestAsAdminPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const { employees, loading: isLoadingEmployees } = useEmployees();
  const { bankHolidaysMap, closuresMap, loading: isLoadingNonWorking } = useNonWorkingDays();

  const form = useForm({
    initialValues: {
      employee: "",
      dateRange: [null, null] as [Date | null, Date | null],
      type: "annual" as LeaveRequestType,
      startHalfDay: false,
      endHalfDay: false,
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

  // Dni nierobocze (bank holidays + company closures) -> jeden Set dla wspolnego helpera
  const nonWorkingDates = useMemo(() => {
    const set = new Set<string>();
    bankHolidaysMap.forEach((_, date) => {
      set.add(date);
    });
    closuresMap.forEach((_, date) => {
      set.add(date);
    });
    return set;
  }, [bankHolidaysMap, closuresMap]);

  const nonWorkingInRange = useMemo(() => {
    const dates: string[] = [];
    if (!startDate || !endDate) return dates;

    let cur = dayjs(startDate);
    const last = dayjs(endDate);
    while (!cur.isAfter(last, "day")) {
      const key = cur.format("YYYY-MM-DD");
      if (nonWorkingDates.has(key)) dates.push(key);
      cur = cur.add(1, "day");
    }
    return dates;
  }, [startDate, endDate, nonWorkingDates]);

  const nonWorkingError =
    nonWorkingInRange.length > 0
      ? `Selected range includes non-working days (${formatDateList(
          nonWorkingInRange
        )}). Please choose a range without bank holidays or company closures.`
      : null;

  const daysRequested =
    startDate && endDate ? countWorkingDays(startDate, endDate, nonWorkingDates) : 0;

  const handleSubmit = async (values: typeof form.values) => {
    const [start, end] = values.dateRange;
    if (!start || !end) return;

    if (nonWorkingError) {
      form.setFieldError("dateRange", nonWorkingError);
      return;
    }

    setSubmitting(true);

    const result = await createLeaveRequest({
      userId: values.employee,
      startDate: dayjs(start).format("YYYY-MM-DD"),
      endDate: dayjs(end).format("YYYY-MM-DD"),
      type: values.type,
      startHalfDay: values.startHalfDay,
      endHalfDay: values.endHalfDay,
    });

    setSubmitting(false);

    if (result.error) {
      form.setFieldError("dateRange", result.error);
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
    const deptName =
      typeof emp.department === "object"
        ? emp.department?.name
        : emp.department;

    return {
      value: emp._id,
      label: `${emp.firstName} ${emp.lastName}`,
      department: deptName || "No department",
      email: emp.email,
    };
  });

  const isDisabled = isLoadingEmployees || isLoadingNonWorking || submitting;

  return (
    <Container size="sm" py="lg" px={{ base: "xs", sm: "md" }}>
      <Stack gap="lg">
        <Title order={2}>Create Leave Request (Admin)</Title>
        <Paper p={{ base: "md", sm: "xl" }} radius="md" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Select
                label="Employee"
                placeholder={
                  isLoadingEmployees
                    ? "Loading employees..."
                    : "Select employee"
                }
                data={selectData}
                searchable
                disabled={isDisabled}
                nothingFoundMessage="No employees found"
                {...form.getInputProps("employee")}
                renderOption={({ option }) => {
                  const emp = selectData.find(
                    (e) => e.value === option.value
                  );
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

              <Select
                label="Leave Type"
                data={LEAVE_REQUEST_TYPES.map((t) => ({
                  value: t,
                  label: getLeaveTypeLabel(t),
                }))}
                allowDeselect={false}
                disabled={isDisabled}
                {...form.getInputProps("type")}
              />

              <DatePickerInput
                type="range"
                label="Holiday Date Range"
                placeholder="Pick start and end date"
                leftSection={<IconCalendar size={18} />}
                valueFormat="YYYY-MM-DD"
                clearable
                disabled={isDisabled}
                excludeDate={(date) =>
                  nonWorkingDates.has(dayjs(date).format("YYYY-MM-DD"))
                }
                getDayProps={(date) => {
                  const formattedDate = dayjs(date).format(
                    "YYYY-MM-DD"
                  );
                  const isBankHoliday =
                    bankHolidaysMap.has(formattedDate);
                  const isClosure =
                    closuresMap.has(formattedDate);

                  if (isBankHoliday) {
                    return {
                      style: {
                        backgroundColor:
                          "var(--mantine-color-red-1)",
                        color: "var(--mantine-color-red-9)",
                        fontWeight: "bold",
                        borderRadius: "8px",
                      },
                    };
                  }

                  if (isClosure) {
                    return {
                      style: {
                        backgroundColor:
                          "var(--mantine-color-gray-2)",
                        color: "var(--mantine-color-gray-8)",
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
                  const formattedDate = dayObj.format(
                    "YYYY-MM-DD"
                  );
                  const isBankHoliday =
                    bankHolidaysMap.has(formattedDate);
                  const isClosure =
                    closuresMap.has(formattedDate);
                  const isHighlighted =
                    isBankHoliday || isClosure;
                  const title = isBankHoliday
                    ? bankHolidaysMap.get(formattedDate)
                    : closuresMap.get(formattedDate);

                  return (
                    <Flex
                      direction="column"
                      align="center"
                      justify="center"
                      style={{
                        height: "100%",
                        width: "100%",
                      }}
                    >
                      <Text
                        size="xs"
                        lh={1}
                        fw={isHighlighted ? 700 : 400}
                      >
                        {dayNum}
                      </Text>
                      {title && (
                        <Text
                          size="7px"
                          lh={1.1}
                          ta="center"
                          mt={2}
                          style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            maxWidth: "100%",
                            paddingLeft: 1,
                            paddingRight: 1,
                          }}
                          title={title}
                        >
                          {title}
                        </Text>
                      )}
                    </Flex>
                  );
                }}
                {...form.getInputProps("dateRange")}
              />

              {nonWorkingError && (
                <Alert
                  icon={<IconAlertTriangle size={16} />}
                  color="red"
                  title="Range includes non-working days"
                  variant="light"
                >
                  {nonWorkingError}
                </Alert>
              )}

              <Group grow>
                <Checkbox
                  label="Start day is half-day"
                  description="First day counts as 0.5 day"
                  {...form.getInputProps("startHalfDay", {
                    type: "checkbox",
                  })}
                  disabled={submitting}
                />
                <Checkbox
                  label="End day is half-day"
                  description="Last day counts as 0.5 day"
                  {...form.getInputProps("endHalfDay", {
                    type: "checkbox",
                  })}
                  disabled={submitting}
                />
              </Group>

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
                      {(() => {
                        let days = daysRequested;
                        if (form.values.startHalfDay)
                          days -= 0.5;
                        if (form.values.endHalfDay)
                          days -= 0.5;
                        return `${days} ${days === 1 ? "day" : "days"
                          }`;
                      })()}
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
                  <Text
                    size="xs"
                    c="dimmed"
                    tt="uppercase"
                    fw={700}
                  >
                    Date Completed
                  </Text>
                  <Flex gap={6} align="center">
                    <IconCalendar
                      size={16}
                      style={{ opacity: 0.7 }}
                    />
                    <Text size="sm" fw={500}>
                      {dayjs(
                        form.values.completedDate
                      ).format("YYYY-MM-DD")}
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