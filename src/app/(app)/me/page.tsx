"use client";

import {
  Badge,
  Box,
  Button,
  Flex,
  Grid,
  Group,
  Loader,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Table,
  Text,
  ThemeIcon,
  Title,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendarPlus,
  IconCheck,
  IconChevronRight,
  IconClock,
  IconPlaneDeparture,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useEmployees } from "@/hooks/useEmployees";
import { useMyLeaveRequests } from "@/hooks/useMyLeaveRequests";
import { useTeamLeaveRequests } from "@/hooks/useTeamLeaveRequests";
import { sumAnnualDaysUsed } from "@/utils/leaveBalance";
import { LEAVE_REQUEST_TYPES, getLeaveTypeLabel } from "@/constants/leaveTypes";
import { getMySickDaysThisYear } from "@/actions/employee/absences/getMySickDaysThisYear";

dayjs.extend(relativeTime);

export default function EmployeeDashboard() {
  const router = useRouter();
  const { employee, loading } = useCurrentEmployee();
  const { requests, loading: requestsLoading } = useMyLeaveRequests();
  const { employees, loading: loadingEmployees } = useEmployees();
  const { requests: teamRequests, loading: loadingTeamRequests } =
    useTeamLeaveRequests();

  const [sickDaysThisYear, setSickDaysThisYear] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await getMySickDaysThisYear();
      if (res.success) {
        setSickDaysThisYear(res.days);
      }
    })();
  }, []);

  const typeLabels: Record<string, string> = Object.fromEntries(
    LEAVE_REQUEST_TYPES.map((t) => [t, getLeaveTypeLabel(t)]),
  );

  const recentRequests = requests.slice(0, 2).map((req) => ({
    id: req._id,
    type: typeLabels[req.type] ?? req.type,
    dates: `${dayjs(req.startDate).format("DD-MM-YYYY")} → ${dayjs(req.endDate).format("DD-MM-YYYY")}`,
    days: req.daysRequested,
    status: req.status,
    submitted: dayjs(req.createdAt).fromNow(),
  }));

  // Pracownicy z mojego dzialu (bez mnie) z zatwierdzonym urlopem
  const colleaguesOnLeave = useMemo(() => {
    if (!employee) return [];

    const myDeptId =
      typeof employee.department === "object"
        ? employee.department?._id
        : employee.department;

    if (!myDeptId) return [];

    const colleagueIds = new Set(
      employees
        .filter((emp) => emp._id !== employee._id)
        .filter((emp) => {
          const deptId =
            typeof emp.department === "object"
              ? emp.department?._id
              : emp.department;
          return deptId === myDeptId;
        })
        .map((emp) => emp._id),
    );

    return teamRequests
      .filter(
        (req) =>
          req.status === "approved" &&
          req.employee &&
          colleagueIds.has(req.employee),
      )
      .sort(
        (a, b) => dayjs(a.startDate).valueOf() - dayjs(b.startDate).valueOf(),
      );
  }, [employee, employees, teamRequests]);

  if (loading || requestsLoading || loadingEmployees || loadingTeamRequests) {
    return (
      <Flex justify="center" align="center" py={80}>
        <Loader />
      </Flex>
    );
  }

  const holidayAllowance = employee?.holidayAllowance ?? 0;

  // Only approved annual leave counts as used allowance; days covered by an
  // absence (sick etc.) are not deducted.
  const annualDaysUsed = sumAnnualDaysUsed(requests);
  // Can go negative when the employee takes more days than their allowance.
  const daysLeft = holidayAllowance - annualDaysUsed;
  const usagePercent =
    holidayAllowance > 0
      ? Math.min((annualDaysUsed / holidayAllowance) * 100, 100)
      : 0;

  // Stats for leave requests still awaiting approval.
  const pendingRequests = requests.filter((req) => req.status === "pending");
  const pendingCount = pendingRequests.length;
  const pendingDays = pendingRequests.reduce(
    (sum, req) => sum + req.daysRequested,
    0,
  );

  return (
    <Stack gap="lg">
      <Paper
        p="lg"
        radius="md"
        withBorder
        style={{ background: "var(--mantine-color-blue-0)" }}
      >
        <Group justify="space-between" align="center" wrap="wrap">
          <Box>
            <Title order={2} size="h3">
              Welcome back, {employee?.firstName ?? "there"}.
            </Title>
            <Text size="sm" c="dimmed" mt={4}>
              Here is your leave summary and upcoming team availability.
            </Text>
          </Box>
          <Button
            component={Link}
            href="/me/leave-requests/new"
            size="md"
            leftSection={<IconCalendarPlus size={18} />}
          >
            Request Time Off
          </Button>
        </Group>
      </Paper>

      <SimpleGrid cols={{ base: 2, md: 3 }} spacing="xs">
        <Paper p="sm" radius="md" withBorder>
          <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>
              Annual Leave
            </Text>
            <ThemeIcon variant="light" color="blue" size="sm" style={{ flexShrink: 0 }}>
              <IconPlaneDeparture size={14} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap="xs">
            <Text size="xl" fw={700} lh={1}>
              {daysLeft}
            </Text>
            <Text size="sm" c="dimmed">
              days left
            </Text>
          </Group>
          <Text size="xs" c="dimmed" mt={4}>
            {annualDaysUsed} used of {holidayAllowance} days
          </Text>
          <Box pos="relative" mt="xs">
            <Progress.Root size="xl" radius="xl">
              <Progress.Section value={usagePercent} color="orange" animated />
              <Progress.Section
                value={Math.max(100 - usagePercent, 0)}
                color="gray"
              />
            </Progress.Root>
            <Text
              size="xs"
              fw={600}
              style={{
                position: "absolute",
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
                pointerEvents: "none",
              }}
            >
              {Math.round(usagePercent)}%
            </Text>
          </Box>
        </Paper>

        <Paper p="sm" radius="md" withBorder>
          <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>
              Sick Leave Used
            </Text>
            <ThemeIcon variant="light" color="red" size="sm" style={{ flexShrink: 0 }}>
              <IconAlertCircle size={14} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap="xs">
            <Text size="lg" fw={700} lh={1}>
              {sickDaysThisYear}
            </Text>
            <Text size="xs" c="dimmed">
              days this year
            </Text>
          </Group>
        </Paper>

        <Paper p="sm" radius="md" withBorder>
          <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
            <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>
              Pending Approval
            </Text>
            <ThemeIcon variant="light" color="orange" size="sm" style={{ flexShrink: 0 }}>
              <IconClock size={14} />
            </ThemeIcon>
          </Group>
          <Group align="baseline" gap="xs">
            <Text size="lg" fw={700} lh={1}>
              {pendingCount}
            </Text>
            <Text size="xs" c="dimmed">
              {pendingCount} {pendingCount === 1 ? "request" : "requests"} ·{" "}
              {pendingDays} {pendingDays === 1 ? "day" : "days"}
            </Text>
          </Group>
        </Paper>
      </SimpleGrid>

      <Grid gap="md">
        <Grid.Col span={{ base: 12, lg: 8 }}>
          <Paper p="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md">
              <Box>
                <Title order={3} size="h4">
                  My Recent Requests
                </Title>
                <Text size="sm" c="dimmed">
                  Track status of your submitted time-off requests
                </Text>
              </Box>
              <Button
                component={Link}
                href="/me/leave-requests"
                variant="subtle"
                size="xs"
                rightSection={<IconChevronRight size={14} />}
              >
                View all
              </Button>
            </Group>

            <Box visibleFrom="sm">
              <Table.ScrollContainer minWidth={500}>
                <Table verticalSpacing="sm" highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Type</Table.Th>
                      <Table.Th>Dates</Table.Th>
                      <Table.Th>Days</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Submitted</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {recentRequests.map((req) => (
                      <Table.Tr
                        key={req.id}
                        onClick={() =>
                          router.push(`/me/leave-requests/${req.id}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {req.type}
                          </Text>
                          <Text size="xs" c="dimmed">
                            {req.id}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{req.dates}</Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">{req.days}d</Text>
                        </Table.Td>
                        <Table.Td>
                          <StatusBadge status={req.status} />
                        </Table.Td>
                        <Table.Td>
                          <Text size="xs" c="dimmed">
                            {req.submitted}
                          </Text>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            </Box>

            <Stack gap="md" hiddenFrom="sm">
              {recentRequests.length === 0 && (
                <Text size="sm" c="dimmed" ta="center">
                  No leave requests found.
                </Text>
              )}
              {recentRequests.map((req) => (
                <Paper
                  key={req.id}
                  p="sm"
                  radius="md"
                  withBorder
                  onClick={() => router.push(`/me/leave-requests/${req.id}`)}
                  style={{ cursor: "pointer" }}
                >
                  <Group justify="space-between" align="center" mb="xs">
                    <Text fw={600} size="md">
                      {req.type}
                    </Text>
                    <StatusBadge status={req.status} />
                  </Group>
                  <Group justify="space-between" gap="xs">
                    <Text size="sm" c="dimmed" flex="0 0 auto">
                      Dates
                    </Text>
                    <Text size="sm">{req.dates}</Text>
                  </Group>
                  <Group justify="space-between" gap="xs">
                    <Text size="sm" c="dimmed" flex="0 0 auto">
                      Days
                    </Text>
                    <Text size="sm">{req.days}d</Text>
                  </Group>
                  <Group justify="space-between" gap="xs">
                    <Text size="sm" c="dimmed" flex="0 0 auto">
                      Submitted
                    </Text>
                    <Text size="xs" c="dimmed">
                      {req.submitted}
                    </Text>
                  </Group>
                </Paper>
              ))}
            </Stack>

            {recentRequests.length > 0 && (
              <Group justify="center" mt="md">
                <Button
                  component={Link}
                  href="/me/leave-requests"
                  variant="subtle"
                  size="xs"
                  rightSection={<IconChevronRight size={14} />}
                >
                  More...
                </Button>
              </Group>
            )}
          </Paper>
        </Grid.Col>

        <Grid.Col span={{ base: 12, lg: 4 }}>
          <Paper p="lg" radius="md" withBorder style={{ height: "100%" }}>
            <Group justify="space-between" mb="md">
              <Group gap="xs">
                <ThemeIcon variant="light" color="indigo" radius="md">
                  <IconUsers size={18} />
                </ThemeIcon>
                <Title order={3} size="h4">
                  Team Absences
                </Title>
              </Group>
            </Group>

            <Text size="xs" c="dimmed" mb="lg">
              Upcoming scheduled time-off for team members in your department.
            </Text>

            <Stack gap="md">
              {colleaguesOnLeave.length === 0 && (
                <Text size="sm" c="dimmed">
                  No one from your team is on leave.
                </Text>
              )}

              {colleaguesOnLeave.map((req) => (
                <Paper
                  key={req._id}
                  p="xs"
                  radius="sm"
                  withBorder
                  bg="var(--mantine-color-gray-0)"
                >
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        {req.employeeName || "Team member"}
                      </Text>
                      <Text size="xs" c="dimmed" tt="capitalize">
                        {typeLabels[req.type] ?? req.type}
                      </Text>
                    </Box>
                    <Badge variant="outline" color="gray" size="sm">
                      {dayjs(req.startDate).format("DD-MM-YYYY")} →{" "}
                      {dayjs(req.endDate).format("DD-MM-YYYY")}
                    </Badge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  );
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge
          color="green"
          variant="light"
          leftSection={<IconCheck size={12} />}
        >
          Approved
        </Badge>
      );
    case "pending":
      return (
        <Badge
          color="orange"
          variant="light"
          leftSection={<IconClock size={12} />}
        >
          Pending
        </Badge>
      );
    case "rejected":
      return (
        <Badge color="red" variant="light" leftSection={<IconX size={12} />}>
          Rejected
        </Badge>
      );
    default:
      return <Badge color="gray">{status}</Badge>;
  }
}
