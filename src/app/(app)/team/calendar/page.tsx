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
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { IconCalendarEvent, IconFilter, IconUsers } from "@tabler/icons-react";
import { useState } from "react";

interface TeamEvent {
  id: string;
  employeeName: string;
  employeeAvatar?: string;
  department: string;
  type: string;
  startDate: string;
  endDate: string;
  status: "Approved" | "Pending";
}

export default function TeamCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedDepartment, setSelectedDepartment] = useState<string | null>("All");

  const [teamEvents] = useState<TeamEvent[]>([
    {
      id: "1",
      employeeName: "Anna Kowalska",
      department: "Development",
      type: "Annual Leave",
      startDate: "2026-08-12",
      endDate: "2026-08-18",
      status: "Approved",
    },
    {
      id: "2",
      employeeName: "Jan Nowak",
      department: "Design",
      type: "Sick Leave",
      startDate: "2026-08-13",
      endDate: "2026-08-14",
      status: "Approved",
    },
    {
      id: "3",
      employeeName: "Piotr Wiśniewski",
      department: "Development",
      type: "Annual Leave",
      startDate: "2026-08-20",
      endDate: "2026-08-25",
      status: "Pending",
    },
  ]);

  const filteredEvents = teamEvents.filter((event) => {
    if (selectedDepartment && selectedDepartment !== "All") {
      return event.department === selectedDepartment;
    }
    return true;
  });

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

      {/* Pasek filtrów */}
      <Paper p="md" radius="md" withBorder bg="var(--mantine-color-body)">
        <Group gap="md">
          <Select
            label="Department"
            placeholder="Filter by department"
            leftSection={<IconFilter size={16} />}
            data={["All", "Development", "Design", "Marketing", "HR"]}
            value={selectedDepartment}
            onChange={setSelectedDepartment}
            style={{ minWidth: 200 }}
          />
          <MultiSelect
            label="Leave Types"
            placeholder="All types"
            data={["Annual Leave", "Sick Leave", "Unpaid Leave", "Remote Work"]}
            style={{ flexGrow: 1 }}
          />
        </Group>
      </Paper>

      {/* Główny układ: Kalendarz + Szczegóły dla Menedżera */}
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
                  Absences for {selectedDate ? selectedDate.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" }) : "Selected Date"}
                </Title>
              </Group>
              <Badge variant="light" color="blue" leftSection={<IconUsers size={12} />}>
                {filteredEvents.length} Absences
              </Badge>
            </Group>

            <Stack gap="sm">
              {filteredEvents.length > 0 ? (
                filteredEvents.map((event) => (
                  <Card
                    key={event.id}
                    p="sm"
                    radius="sm"
                    withBorder
                    bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                  >
                    <Group justify="space-between" align="center">
                      <Group gap="sm">
                        <Avatar color="blue" radius="xl">
                          {event.employeeName
                            .split(" ")
                            .map((n) => n[0])
                            .join("")}
                        </Avatar>
                        <div>
                          <Text size="sm" fw={600}>
                            {event.employeeName}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {event.department} • {event.type}
                          </Text>
                        </div>
                      </Group>

                      <Group gap="xs">
                        <Text size="xs" fw={500}>
                          {event.startDate} - {event.endDate}
                        </Text>
                        <Badge
                          color={event.status === "Approved" ? "green" : "yellow"}
                          variant="dot"
                        >
                          {event.status}
                        </Badge>
                      </Group>
                    </Group>
                  </Card>
                ))
              ) : (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                  No planned absences for this criteria.
                </Text>
              )}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}