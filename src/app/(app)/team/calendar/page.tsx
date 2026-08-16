"use client";

import {
  Badge,
  Group,
  MultiSelect,
  Paper,
  Select,
  Stack,
  Text,
  Title,
  Loader,
  Center,
  SegmentedControl,
} from "@mantine/core";
import {
  Schedule,
  MobileMonthView,
  type ScheduleEventData,
} from "@mantine/schedule";
import { IconFilter, IconUsers } from "@tabler/icons-react";
import { useMemo, useState } from "react";
import dayjs from "dayjs";
import { useTeamLeaveRequests } from "@/hooks/useTeamLeaveRequests";

const typeColors: Record<string, string> = {
  annual: "blue",
  sick: "red",
  unpaid: "orange",
  other: "gray",
};

const typeLabels: Record<string, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  unpaid: "Unpaid Leave",
  other: "Other Leave",
};

export default function TeamCalendarPage() {
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>("All");
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [mobileView, setMobileView] = useState<"calendar" | "list">("calendar");
  const [mobileDate, setMobileDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [mobileSelectedDate, setMobileSelectedDate] = useState<string | null>(
    dayjs().format("YYYY-MM-DD")
  );

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

  const filteredRequests = useMemo(() => {
    return requests.filter((req) => {
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
  }, [requests, selectedDepartment, selectedTypes]);

  const scheduleEvents: ScheduleEventData[] = useMemo(() => {
    return filteredRequests.map((req) => {
      const fullName = `${req.employee?.firstName || ""} ${req.employee?.lastName || ""}`.trim();
      const typeLabel = typeLabels[req.type] || req.type;
      const statusLabel = req.status.charAt(0).toUpperCase() + req.status.slice(1);

      const startDateFormatted = dayjs(req.startDate).format("YYYY-MM-DD");
      const endDateFormatted = dayjs(req.endDate).format("YYYY-MM-DD");

      return {
        id: req._id,
        title: `${fullName} - ${typeLabel} (${statusLabel})`,
        start: `${startDateFormatted} 00:00:00`,
        end: `${endDateFormatted} 23:59:59`,
        color: typeColors[req.type] || "gray",
      };
    });
  }, [filteredRequests]);

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
          <Badge
            variant="light"
            color="blue"
            size="lg"
            leftSection={<IconUsers size={14} />}
            style={{ alignSelf: "flex-end", marginBottom: 2 }}
          >
            {filteredRequests.length} Absences
          </Badge>
        </Group>
      </Paper>

      {loading ? (
        <Center py="xl">
          <Loader size="md" />
        </Center>
      ) : (
        <>
          {/* Mobile view toggle */}
          <Paper
            p="xs"
            radius="md"
            withBorder
            bg="var(--mantine-color-body)"
            hiddenFrom="md"
          >
            <SegmentedControl
              value={mobileView}
              onChange={(val) => setMobileView(val as "calendar" | "list")}
              data={[
                { value: "calendar", label: "Calendar" },
                { value: "list", label: "List" },
              ]}
              fullWidth
            />
          </Paper>

          {/* Mobile: Calendar view (Schedule) */}
          <Paper
            p="md"
            radius="md"
            withBorder
            bg="var(--mantine-color-body)"
            hiddenFrom="md"
            display={mobileView === "calendar" ? "block" : "none"}
          >
            <Schedule
              events={scheduleEvents}
              defaultView="month"
              monthViewProps={{
                firstDayOfWeek: 1,
              }}
              weekViewProps={{
                firstDayOfWeek: 1,
                startTime: "08:00:00",
                endTime: "18:00:00",
              }}
              dayViewProps={{
                startTime: "08:00:00",
                endTime: "18:00:00",
              }}
            />
          </Paper>

          {/* Mobile: List view (MobileMonthView) */}
          <Paper
            p="md"
            radius="md"
            withBorder
            bg="var(--mantine-color-body)"
            hiddenFrom="md"
            display={mobileView === "list" ? "block" : "none"}
          >
            <MobileMonthView
              date={mobileDate}
              onDateChange={setMobileDate}
              selectedDate={mobileSelectedDate}
              onSelectedDateChange={setMobileSelectedDate}
              events={scheduleEvents}
              firstDayOfWeek={1}
            />
          </Paper>

          {/* Desktop: Schedule component */}
          <Paper
            p="md"
            radius="md"
            withBorder
            bg="var(--mantine-color-body)"
            visibleFrom="md"
          >
            <Schedule
              events={scheduleEvents}
              defaultView="month"
              monthViewProps={{
                firstDayOfWeek: 1,
              }}
              weekViewProps={{
                firstDayOfWeek: 1,
                startTime: "08:00:00",
                endTime: "18:00:00",
              }}
              dayViewProps={{
                startTime: "08:00:00",
                endTime: "18:00:00",
              }}
            />
          </Paper>
        </>
      )}
    </Stack>
  );
}