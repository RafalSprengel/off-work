"use client";

import {
  Avatar,
  Badge,
  Card,
  Grid,
  Group,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  Title,
  Loader,
  Center,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconCalendarEvent, IconFilter, IconUsers } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { useTeamLeaveRequests } from "@/hooks/useTeamLeaveRequests";

dayjs.extend(isSameOrAfter);
dayjs.extend(isSameOrBefore);

export default function TeamCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>("All");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);

  const { requests, loading } = useTeamLeaveRequests();

  const departmentsList = useMemo(() => {
    const depts = new Set<string>();
    requests.forEach((req) => {
      if (req.employee?.department?.name) {
        depts.add(req.employee.department.name);
      }
    });
    return ["All", ...Array.from(depts)];
  }, [requests]);

  const filteredEvents = useMemo(() => {
    return requests.filter((req) => {
      if (selectedDate) {
        const dateStr = dayjs(selectedDate).format("YYYY-MM-DD");
        const isWithinRange =
          dayjs(dateStr).isSameOrAfter(req.startDate, "day") &&
          dayjs(dateStr).isSameOrBefore(req.endDate, "day");
        if (!isWithinRange) return false;
      }

      if (
        selectedDepartment &&
        selectedDepartment !== "All" &&
        req.employee?.department?.name !== selectedDepartment
      ) {
        return false;
      }

      if (selectedTypes.length > 0 && !selectedTypes.includes(req.type)) {
        return false;
      }

      return true;
    });
  }, [requests, selectedDate, selectedDepartment, selectedTypes]);

  const leaveTypeLabels: Record<string, string> = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    unpaid: "Unpaid Leave",
    other: "Other Leave",
  };

  return (
    <Stack gap="lg">
      <Group justify="space-between" align="center">
        <div>
          <Title order={2}>Team Calendar</Title>
          <Text size="sm" c="dimmed">
            Overview of team absences, holidays, and pending leave requests
          </Text>
        </div>
      </Group>

      <Paper p="md" radius="md" withBorder bg="var(--mantine-color-body)">
        <Group gap="md">
          <Select
            label="Department"
            placeholder="Filter by department"
            leftSection={<IconFilter size={16} />}
            data={departmentsList}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            style={{ minWidth: 200 }}
          />
          <MultiSelect
            label="Leave Types"
            placeholder="All types"
            data={[
              { value: "annual", label: "Annual Leave" },
              { value: "sick", label: "Sick Leave" },
              { value: "unpaid", label: "Unpaid Leave" },
              { value: "other", label: "Other" },
            ]}
            value={selectedTypes}
            onChange={setSelectedTypes}
            style={{ flexGrow: 1 }}
          />
        </Group>
      </Paper>

      <Grid gap="md" align="start">
        <Grid.Col span={{ base: 12, md: 5, lg: 4 }}>
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
              onChange={(val) => setSelectedDate(val as Date | null)}
              size="md"
            />
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7, lg: 8 }}>
          <Paper
            p="md"
            radius="md"
            withBorder
            bg="var(--mantine-color-body)"
            style={{ minHeight: 380 }}
          >
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <IconCalendarEvent size={20} />
                <Title order={4}>
                  Absences for{" "}
                  {selectedDate
                    ? selectedDate.toLocaleDateString("en-US", {
                      month: "long",
                      day: "numeric",
                      year: "numeric",
                    })
                    : "Selected Date"}
                </Title>
              </Group>
              <Badge variant="light" color="blue" leftSection={<IconUsers size={12} />}>
                {filteredEvents.length} Absences
              </Badge>
            </Group>

            {loading ? (
              <Center py="xl">
                <Loader size="md" />
              </Center>
            ) : (
              <Stack gap="sm">
                {filteredEvents.length > 0 ? (
                  filteredEvents.map((event) => {
                    const fullName = `${event.employee?.firstName || ""} ${event.employee?.lastName || ""
                      }`.trim();
                    const initials =
                      `${event.employee?.firstName?.[0] || ""}${event.employee?.lastName?.[0] || ""
                        }`.toUpperCase() || "?";

                    return (
                      <Card
                        key={event._id}
                        p="sm"
                        radius="sm"
                        withBorder
                        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                      >
                        <Group justify="space-between" align="center">
                          <Group gap="sm">
                            <Avatar color="blue" radius="xl">
                              {initials}
                            </Avatar>
                            <div>
                              <Text size="sm" fw={600}>
                                {fullName || "Unknown Employee"}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {event.employee?.department?.name || "No Department"} •{" "}
                                {leaveTypeLabels[event.type] || event.type}
                              </Text>
                            </div>
                          </Group>

                          <Group gap="xs">
                            <Text size="xs" fw={500}>
                              {event.startDate} - {event.endDate}
                            </Text>
                            <Badge
                              color={
                                event.status === "approved"
                                  ? "green"
                                  : event.status === "pending"
                                    ? "yellow"
                                    : "red"
                              }
                              variant="dot"
                            >
                              {event.status}
                            </Badge>
                          </Group>
                        </Group>
                      </Card>
                    );
                  })
                ) : (
                  <Text size="sm" c="dimmed" ta="center" py="xl">
                    No planned absences for this criteria.
                  </Text>
                )}
              </Stack>
            )}
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}