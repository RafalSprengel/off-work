"use client";

import { Group, Paper, Stack, Text } from "@mantine/core";
import { Schedule, type ScheduleEventData } from "@mantine/schedule";

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  flexShrink: 0,
  background: "var(--mantine-color-blue-6)",
};

export interface EmployeeScheduleEvent {
  id: string;
  title: string;
  start: string;
  end: string;
}

interface HolidayScheduleProps {
  events: EmployeeScheduleEvent[];
  closures?: EmployeeScheduleEvent[];
}

export default function HolidaySchedule({
  events,
  closures = [],
}: HolidayScheduleProps) {
  const scheduleEvents: ScheduleEventData[] = [
    ...events.map((event) => ({ ...event, color: "blue" })),
    ...closures.map((event) => ({ ...event, color: "gray" })),
  ];

  // Dostepne widoki: tylko rok i miesiac (bez week i day)
  const viewSelectProps = { views: ["year", "month"] } as const;

  return (
    <Stack gap="lg" w="100%">
      <Schedule
        events={scheduleEvents}
        defaultView="year"
        monthViewProps={{
          firstDayOfWeek: 1,
          viewSelectProps,
        }}
        weekViewProps={{
          firstDayOfWeek: 1,
          startTime: "08:00:00",
          endTime: "18:00:00",
          viewSelectProps,
        }}
        dayViewProps={{
          startTime: "08:00:00",
          endTime: "18:00:00",
          viewSelectProps,
        }}
        yearViewProps={{
          viewSelectProps,
          withOutsideDays: false,
        }}
      />

      <Paper withBorder radius="md" p="sm">
        <Group gap="xs" align="center">
          <span style={dotStyle} />
          <Text size="sm">Annual leave</Text>
        </Group>
      </Paper>

      {closures.length > 0 && (
        <Paper withBorder radius="md" p="sm">
          <Group gap="xs" align="center">
            <span
              style={{
                ...dotStyle,
                background: "var(--mantine-color-gray-6)",
              }}
            />
            <Text size="sm">Closure days</Text>
          </Group>
        </Paper>
      )}
    </Stack>
  );
}
