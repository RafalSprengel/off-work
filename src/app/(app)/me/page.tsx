"use client";

import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
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
  Tooltip,
} from "@mantine/core";
import {
  IconAlertCircle,
  IconCalendarPlus,
  IconCalendarStats,
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
import { useMemo } from "react";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";
import { useEmployees } from "@/hooks/useEmployees";
import { useMyLeaveRequests } from "@/hooks/useMyLeaveRequests";
import { useTeamLeaveRequests } from "@/hooks/useTeamLeaveRequests";

dayjs.extend(relativeTime);

export default function EmployeeDashboard() {
  const router = useRouter();
  const { employee, loading } = useCurrentEmployee();
  const { requests, loading: requestsLoading } = useMyLeaveRequests();
  const { employees, loading: loadingEmployees } = useEmployees();
  const { requests: teamRequests, loading: loadingTeamRequests } =
    useTeamLeaveRequests();

  const typeLabels: Record<string, string> = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    unpaid: "Unpaid Leave",
    other: "Other",
  };

  const recentRequests = requests.map((req) => ({
    id: req._id,
    type: typeLabels[req.type] ?? req.type,
    dates: `${dayjs(req.startDate).format("D MMM YYYY")} - ${dayjs(req.endDate).format("D MMM YYYY")}`,
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

  // Only approved annual leave counts as used allowance.
  const annualDaysUsed = requests
    .filter((req) => req.status === "approved" && req.type === "annual")
    .reduce((sum, req) => sum + req.daysRequested, 0);
  const daysLeft = Math.max(holidayAllowance - annualDaysUsed, 0);

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

      <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Annual Leave
            </Text>
            <ThemeIcon variant="light" color="blue">
              <IconPlaneDeparture size={16} />
            </ThemeIcon>
          </Group>
          <Group align="flex-end" gap="xs">
            <Text size="xl" fw={700}>
              {daysLeft}
            </Text>
            <Text size="sm" c="dimmed" mb={2}>
              / {holidayAllowance} days left
            </Text>
          </Group>
          <Progress
            value={holidayAllowance ? (daysLeft / holidayAllowance) * 100 : 0}
            mt="md"
            size="sm"
            color="blue"
          />
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Sick Leave Used
            </Text>
            <ThemeIcon variant="light" color="red">
              <IconAlertCircle size={16} />
            </ThemeIcon>
          </Group>
          <Group align="flex-end" gap="xs">
            <Text size="xl" fw={700}>
              2
            </Text>
            <Text size="sm" c="dimmed" mb={2}>
              days this year
            </Text>
          </Group>
          <Progress value={(2 / 10) * 100} mt="md" size="sm" color="red" />
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Pending Approval
            </Text>
            <ThemeIcon variant="light" color="orange">
              <IconClock size={16} />
            </ThemeIcon>
          </Group>
          <Group align="flex-end" gap="xs">
            <Text size="xl" fw={700}>
              {pendingCount}
            </Text>
            <Text size="sm" c="dimmed" mb={2}>
              {pendingCount} {pendingCount === 1 ? "request" : "requests"} ·{" "}
              {pendingDays} {pendingDays === 1 ? "day" : "days"}
            </Text>
          </Group>
          <Progress
            value={
              holidayAllowance
                ? Math.min((pendingDays / holidayAllowance) * 100, 100)
                : 0
            }
            mt="md"
            size="sm"
            color="orange"
          />
        </Paper>

        <Paper p="md" radius="md" withBorder>
          <Group justify="space-between" mb="xs">
            <Text size="sm" c="dimmed" fw={500}>
              Remote Work Balance
            </Text>
            <ThemeIcon variant="light" color="teal">
              <IconCalendarStats size={16} />
            </ThemeIcon>
          </Group>
          <Group align="flex-end" gap="xs">
            <Text size="xl" fw={700}>
              4
            </Text>
            <Text size="sm" c="dimmed" mb={2}>
              / 6 days left this month
            </Text>
          </Group>
          <Progress value={(4 / 6) * 100} mt="md" size="sm" color="teal" />
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
                      {dayjs(req.startDate).format("MMM D")} -{" "}
                      {dayjs(req.endDate).format("MMM D")}
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
