'use client'

import {
  Card,
  Text,
  Title,
  Button,
  Badge,
  Group,
  Stack,
  SimpleGrid,
  Grid,
  ThemeIcon,
  Box,
  Paper,
  Progress,
  Table,
  ActionIcon,
  Tooltip,
  Loader,
  Flex,
} from "@mantine/core"
import {
  IconCalendarPlus,
  IconCalendarStats,
  IconClock,
  IconCheck,
  IconX,
  IconAlertCircle,
  IconUsers,
  IconChevronRight,
  IconPlaneDeparture,
} from "@tabler/icons-react"
import Link from "next/link"
import { useRouter } from "next/navigation";
import { useCurrentEmployee } from "@/hooks/useCurrentEmployee";

export default function EmployeeDashboard() {
  const router = useRouter();
  const { employee, loading } = useCurrentEmployee();

  const recentRequests = [
    {
      id: "REQ-104",
      type: "Annual Leave",
      dates: "24 Aug 2026 - 28 Aug 2026",
      days: 5,
      status: "pending",
      submitted: "2 hours ago",
    },
    {
      id: "REQ-098",
      type: "Sick Leave",
      dates: "12 Jul 2026 - 13 Jul 2026",
      days: 2,
      status: "approved",
      submitted: "12 Jul 2026",
    },
    {
      id: "REQ-082",
      type: "Remote Work",
      dates: "01 Jun 2026 - 02 Jun 2026",
      days: 2,
      status: "approved",
      submitted: "28 May 2026",
    },
    {
      id: "REQ-071",
      type: "Unpaid Leave",
      dates: "15 Apr 2026 - 16 Apr 2026",
      days: 2,
      status: "rejected",
      submitted: "10 Apr 2026",
    },
  ]

  const upcomingTeamAbsences = [
    { name: "Sarah Connor", type: "Annual Leave", dates: "Tomorrow" },
    { name: "Mike Ross", type: "Remote Work", dates: "18 Aug - 20 Aug" },
    { name: "Emma Watson", type: "Annual Leave", dates: "25 Aug - 01 Sep" },
  ]

  if (loading) {
    return (
      <Flex justify="center" align="center" py={80}>
        <Loader />
      </Flex>
    )
  }

  const holidayAllowance = employee?.holidayAllowance ?? 0;
  // TODO: replace with a real count once leave requests are wired to this page.
  const daysUsedPlaceholder = 8;
  const daysLeft = Math.max(holidayAllowance - daysUsedPlaceholder, 0);

  return (
    <Stack gap="lg">
      <Paper p="lg" radius="md" withBorder style={{ background: "var(--mantine-color-blue-0)" }}>
        <Group justify="space-between" align="center" wrap="wrap">
          <Box>
            <Title order={2} size="h3">
              Welcome back, {employee?.firstName ?? "there"} 👋
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
              1
            </Text>
            <Text size="sm" c="dimmed" mb={2}>
              request (5 days)
            </Text>
          </Group>
          <Progress value={100} mt="md" size="sm" color="orange" />
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
                href="/leave/history"
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
                    <Table.Tr key={req.id} onClick={() => router.push(`/me/leave-requests/${req.id}`)}
                      style={{ cursor: "pointer" }}>
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
              {upcomingTeamAbsences.map((item, index) => (
                <Paper key={index} p="xs" radius="sm" withBorder bg="var(--mantine-color-gray-0)">
                  <Group justify="space-between" align="center">
                    <Box>
                      <Text size="sm" fw={500}>
                        {item.name}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {item.type}
                      </Text>
                    </Box>
                    <Badge variant="outline" color="gray" size="sm">
                      {item.dates}
                    </Badge>
                  </Group>
                </Paper>
              ))}
            </Stack>
          </Paper>
        </Grid.Col>
      </Grid>
    </Stack>
  )
}

function StatusBadge({ status }: { status: string }) {
  switch (status) {
    case "approved":
      return (
        <Badge color="green" variant="light" leftSection={<IconCheck size={12} />}>
          Approved
        </Badge>
      )
    case "pending":
      return (
        <Badge color="orange" variant="light" leftSection={<IconClock size={12} />}>
          Pending
        </Badge>
      )
    case "rejected":
      return (
        <Badge color="red" variant="light" leftSection={<IconX size={12} />}>
          Rejected
        </Badge>
      )
    default:
      return <Badge color="gray">{status}</Badge>
  }
}