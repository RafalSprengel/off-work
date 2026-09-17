"use client";

import {
  Center,
  Flex,
  Grid,
  Group,
  Loader,
  Paper,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import dayjs from "dayjs";
import { useMemo, useState } from "react";

import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useEmployees } from "@/hooks/useEmployees";
import { useMyLeaveRequests } from "@/hooks/useMyLeaveRequests";
import { useTeamLeaveRequests } from "@/hooks/useTeamLeaveRequests";
import { useNonWorkingDays } from "@/hooks/useNonWorkingDays";

const dotStyle: React.CSSProperties = {
  width: 6,
  height: 6,
  borderRadius: "50%",
  flexShrink: 0,
};

export default function EmployeeCalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);

  const { employee: currentEmployee, loading: loadingEmployee } =
    useCurrentEmployee();
  const { employees, loading: loadingEmployees } = useEmployees();
  const { requests: myRequests, loading: loadingMyRequests } =
    useMyLeaveRequests();
  const { requests: teamRequests, loading: loadingTeamRequests } =
    useTeamLeaveRequests();
  const { closuresMap, loading: loadingClosures } = useNonWorkingDays();

  const loading =
    loadingEmployee ||
    loadingEmployees ||
    loadingMyRequests ||
    loadingTeamRequests ||
    loadingClosures;

  // Wszystkie moje zatwierdzone urlopy -> zielone kropki
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

  // Pracownicy z mojego dzialu, bez mnie
  const colleagueIds = useMemo(() => {
    if (!currentEmployee) return new Set<string>();

    const myDeptId =
      typeof currentEmployee.department === "object"
        ? currentEmployee.department?._id
        : currentEmployee.department;

    if (!myDeptId) return new Set<string>();

    return new Set(
      employees
        .filter((emp) => emp._id !== currentEmployee._id)
        .filter((emp) => {
          const deptId =
            typeof emp.department === "object"
              ? emp.department?._id
              : emp.department;
          return deptId === myDeptId;
        })
        .map((emp) => emp._id),
    );
  }, [currentEmployee, employees]);

  // Zatwierdzone urlopy pracownikow z tego samego dzialu -> niebieskie kropki
  const deptApprovedDates = useMemo(() => {
    const dates = new Set<string>();

    teamRequests
      .filter(
        (req) =>
          req.status === "approved" &&
          req.employee &&
          colleagueIds.has(req.employee),
      )
      .forEach((req) => {
        let cur = dayjs(req.startDate);
        const last = dayjs(req.endDate);
        while (cur.isBefore(last) || cur.isSame(last, "day")) {
          dates.add(cur.format("YYYY-MM-DD"));
          cur = cur.add(1, "day");
        }
      });

    return dates;
  }, [teamRequests, colleagueIds]);

  // Zatwierdzone urlopy kolegow z dzialu (do listy w panelu)
  const colleaguesApprovedRequests = useMemo(() => {
    return teamRequests
      .filter(
        (req) =>
          req.status === "approved" &&
          req.employee &&
          colleagueIds.has(req.employee),
      )
      .sort(
        (a, b) =>
          dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
      );
  }, [teamRequests, colleagueIds]);

  // Dni zamkniecia firmy (Closure days)
  const closureDates = useMemo(() => new Set(closuresMap.keys()), [closuresMap]);

  const renderDay = (date: Date | string) => {
    const key = dayjs(date).format("YYYY-MM-DD");
    const hasMine = myApprovedDates.has(key);
    const hasDept = deptApprovedDates.has(key);
    const hasClosure = closureDates.has(key);

    return (
      <Stack align="center" justify="center" gap={2} h="100%">
        <div>{dayjs(date).date()}</div>
        {/* Stala wysokosc slota, zeby wszystkie dni wygladaly tak samo */}
        <Flex gap={3} align="center" style={{ height: 6 }}>
          {hasMine && (
            <span
              style={{
                ...dotStyle,
                background: "var(--mantine-color-green-6)",
              }}
            />
          )}
          {hasDept && (
            <span
              style={{ ...dotStyle, background: "var(--mantine-color-blue-6)" }}
            />
          )}
          {hasClosure && (
            <span
              style={{ ...dotStyle, background: "var(--mantine-color-gray-6)" }}
            />
          )}
        </Flex>
      </Stack>
    );
  };

  const renderLegend = (dotColor: string, label: string) => (
    <Group gap="xs" align="center">
      <span
        style={{
          ...dotStyle,
          background: `var(--mantine-color-${dotColor}-6)`,
        }}
      />
      <Text size="sm">{label}</Text>
    </Group>
  );

  if (loading) {
    return (
      <Center py="xl">
        <Loader />
      </Center>
    );
  }

  return (
    <Stack gap="lg">
      <Title order={2}>My Schedule & Calendar</Title>

      <Grid gap="md" align="start">
        <Grid.Col span={{ base: 12, md: "auto" }}>
          <Paper
            p="md"
            radius="md"
            withBorder
            bg="var(--mantine-color-body)"
            display="flex"
            style={{ justifyContent: "center" }}
          >
            <Stack gap="md" align="center">
              <DatePicker
                value={selectedDate}
                onChange={setSelectedDate}
                size="md"
                renderDay={renderDay}
              />
              <Stack gap="xs" align="flex-start" w="100%">
                {renderLegend("green", "My approved leave")}
                {renderLegend("blue", "Team members on leave")}
                {renderLegend("gray", "Closure days")}
              </Stack>
            </Stack>
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: "auto" }}>
          <Paper
            p="md"
            radius="md"
            withBorder
            bg="var(--mantine-color-body)"
            style={{ minHeight: 350 }}
          >
            <Title order={4} mb="md">
              Others team members on leave
            </Title>

            <Stack gap="xs">
              {colleaguesApprovedRequests.length === 0 && (
                <Text size="sm" c="dimmed">
                  No one from your team is on leave.
                </Text>
              )}

              {colleaguesApprovedRequests.map((req) => (
                <Paper
                  key={req._id}
                  p="sm"
                  radius="sm"
                  withBorder
                  bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                >
                  <Group justify="space-between" mb="xs">
                    <Text fw={600} size="sm">
                      {req.employeeName || "Team member"}
                    </Text>
                    <span
                      style={{
                        ...dotStyle,
                        background: "var(--mantine-color-blue-6)",
                      }}
                    />
                  </Group>
                  <Text size="xs" c="dimmed" tt="capitalize">
                    {req.type} Leave
                  </Text>
                  <Text size="xs" c="dimmed">
                    {dayjs(req.startDate).format("MMM D, YYYY")} -{" "}
                    {dayjs(req.endDate).format("MMM D, YYYY")}
                  </Text>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}
