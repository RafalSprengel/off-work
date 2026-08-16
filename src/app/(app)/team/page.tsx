'use client';

import {
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
    Table,
    ActionIcon,
    Tooltip,
    Avatar,
    Menu,
    Loader,
    Flex,
} from "@mantine/core"
import {
    IconUsers,
    IconClock,
    IconCheck,
    IconX,
    IconDotsVertical,
    IconCalendarStats,
    IconUserPlus,
    IconSettings,
    IconChevronRight,
    IconAdjustments,
    IconCalendar,
} from "@tabler/icons-react"
import dayjs from "dayjs"
import relativeTime from "dayjs/plugin/relativeTime"
import Link from "next/link"
import { useTeamDashboard } from "@/hooks/useTeamDashboard"

dayjs.extend(relativeTime)

const typeLabels: Record<string, string> = {
    annual: "Annual Leave",
    sick: "Sick Leave",
    unpaid: "Unpaid Leave",
    other: "Other",
}

function formatDateRange(startDate: string, endDate: string): string {
    const start = dayjs(startDate, "YYYY-MM-DD")
    const end = dayjs(endDate, "YYYY-MM-DD")
    return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`
}

export default function AdminDashboard() {
    const { data, loading } = useTeamDashboard()

    if (loading) {
        return (
            <Flex justify="center" align="center" py={80}>
                <Loader />
            </Flex>
        )
    }

    if (!data) {
        return (
            <Text ta="center" py={80} c="dimmed">
                Failed to load dashboard data
            </Text>
        )
    }

    const todayStr = dayjs().format("MMMM D, YYYY")
    const todayAbsences = data.todayAbsences || []

    return (
        <Stack gap="lg">
            {/* Top Banner */}
            <Paper p="lg" radius="md" withBorder style={{ background: "var(--mantine-color-dark-8)", color: "var(--mantine-color-white)" }}>
                <Group justify="space-between" align="center" wrap="wrap">
                    <Box>
                        <Title order={2} size="h3" style={{ color: "var(--mantine-color-white)" }}>
                            Admin & HR Overview ⚙️
                        </Title>
                        <Text size="sm" c="dimmed" mt={4}>
                            Manage company-wide leaves, employee allowances, and system configurations.
                        </Text>
                    </Box>
                    <Group gap="xs">
                        <Button
                            component={Link}
                            href="/team/employees"
                            variant="light"
                            color="blue"
                            size="sm"
                            leftSection={<IconUserPlus size={16} />}
                        >
                            Add Employee
                        </Button>
                        <Button
                            component={Link}
                            href="/admin/settings"
                            variant="default"
                            size="sm"
                            leftSection={<IconSettings size={16} />}
                        >
                            Settings
                        </Button>
                    </Group>
                </Group>
            </Paper>

            {/* Company Level Stats */}
            <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="md">
                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" align="center" wrap="nowrap" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>
                            Total Employees
                        </Text>
                        <ThemeIcon variant="light" color="blue" style={{ flexShrink: 0 }}>
                            <IconUsers size={16} />
                        </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700}>
                        {data.totalEmployees}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        Across {data.departmentOverview.length} departments
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" align="center" wrap="nowrap" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>
                            Currently On Leave
                        </Text>
                        <ThemeIcon variant="light" color="teal" style={{ flexShrink: 0 }}>
                            <IconCalendarStats size={16} />
                        </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700}>
                        {data.activeOnLeave}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        {data.totalEmployees > 0
                            ? `${((data.activeOnLeave / data.totalEmployees) * 100).toFixed(1)}% of total workforce`
                            : "0% of total workforce"}
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" align="center" wrap="nowrap" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>
                            Pending Requests
                        </Text>
                        <ThemeIcon variant="light" color="orange" style={{ flexShrink: 0 }}>
                            <IconClock size={16} />
                        </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700}>
                        {data.pendingApprovals}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        Requires manager action
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" align="center" wrap="nowrap" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>
                            On Leave This Week
                        </Text>
                        <ThemeIcon variant="light" color="red" style={{ flexShrink: 0 }}>
                            <IconCalendarStats size={16} />
                        </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700}>
                        {data.onLeaveThisWeek}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        Approved for this week
                    </Text>
                </Paper>
            </SimpleGrid>

            {/* Today Absences Section */}
            <Paper p="lg" radius="md" withBorder>
                <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs" align="center">
                        <IconCalendar size={22} />
                        <Title order={3} size="h4" fw={700}>
                            Absences for {todayStr}
                        </Title>
                    </Group>
                    <Badge variant="light" color="blue" size="lg" leftSection={<IconUsers size={14} />}>
                        {todayAbsences.length} ABSENCES
                    </Badge>
                </Group>

                {todayAbsences.length === 0 ? (
                    <Text ta="center" py="xl" c="dimmed">
                        No absences for today
                    </Text>
                ) : (
                    <Stack gap="sm">
                        {todayAbsences.map((absence) => (
                            <Paper key={absence._id} p="md" radius="md" style={{ border: "1px solid var(--mantine-color-gray-3)", backgroundColor: "var(--mantine-color-gray-0)" }}>
                                <Group justify="space-between" align="center">
                                    <Group gap="md">
                                        <Avatar
                                            name={`${absence.employee.firstName} ${absence.employee.lastName}`}
                                            radius="xl"
                                            size="md"
                                            color="blue"
                                            variant="light"
                                        />
                                        <Box>
                                            <Text size="sm" fw={700}>
                                                {absence.employee.firstName} {absence.employee.lastName}
                                            </Text>
                                            <Text size="xs" c="dimmed">
                                                {absence.employee.department?.name ?? "No Department"} • {typeLabels[absence.type] ?? absence.type}
                                            </Text>
                                        </Box>
                                    </Group>

                                    <Group gap="md">
                                        <Text size="sm" fw={600} c="dimmed">
                                            {dayjs(absence.startDate).format("YYYY-MM-DD")} - {dayjs(absence.endDate).format("YYYY-MM-DD")}
                                        </Text>
                                        <Badge
                                            color="green"
                                            variant="outline"
                                            size="lg"
                                            radius="xl"
                                            leftSection={<Box style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: "var(--mantine-color-green-6)" }} />}
                                        >
                                            APPROVED
                                        </Badge>
                                    </Group>
                                </Group>
                            </Paper>
                        ))}
                    </Stack>
                )}
            </Paper>

            {/* Main Content Grid */}
            <Grid gap="md">
                {/* Pending Leave Requests Table */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Paper p="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Box>
                                <Title order={3} size="h4">
                                    Latest Pending Leave Requests
                                </Title>
                                <Text size="sm" c="dimmed">
                                    Review and override company-wide time off requests
                                </Text>
                            </Box>
                            <Button
                                component={Link}
                                href="/team/leave-requests"
                                variant="subtle"
                                size="xs"
                                rightSection={<IconChevronRight size={14} />}
                            >
                                View All ({data.pendingApprovals})
                            </Button>
                        </Group>

                        {data.pendingRequests.length === 0 ? (
                            <Text ta="center" py="xl" c="dimmed">
                                No pending leave requests
                            </Text>
                        ) : (
                            <Table.ScrollContainer minWidth={600}>
                                <Table verticalSpacing="sm" highlightOnHover>
                                    <Table.Thead>
                                        <Table.Tr>
                                            <Table.Th>Employee</Table.Th>
                                            <Table.Th>Type</Table.Th>
                                            <Table.Th>Dates</Table.Th>
                                            <Table.Th>Days</Table.Th>
                                            <Table.Th>Actions</Table.Th>
                                        </Table.Tr>
                                    </Table.Thead>
                                    <Table.Tbody>
                                        {data.pendingRequests.map((req) => (
                                            <Table.Tr key={req._id}>
                                                <Table.Td>
                                                    <Group gap="sm" wrap="nowrap">
                                                        <Avatar
                                                            name={`${req.employee.firstName} ${req.employee.lastName}`}
                                                            radius="xl"
                                                            size="sm"
                                                            color="initials"
                                                        />
                                                        <Box>
                                                            <Text size="sm" fw={500}>
                                                                {req.employee.firstName} {req.employee.lastName}
                                                            </Text>
                                                            <Text size="xs" c="dimmed">
                                                                {req.employee.department?.name ?? "No Department"}
                                                            </Text>
                                                        </Box>
                                                    </Group>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Badge variant="light" color="blue" size="sm">
                                                        {typeLabels[req.type] ?? req.type}
                                                    </Badge>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm">{formatDateRange(req.startDate, req.endDate)}</Text>
                                                    <Text size="xs" c="dimmed">
                                                        Submitted {dayjs(req.createdAt).fromNow()}
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Text size="sm" fw={500}>
                                                        {req.daysRequested}d
                                                    </Text>
                                                </Table.Td>
                                                <Table.Td>
                                                    <Group gap={4} wrap="nowrap">
                                                        <Tooltip label="Approve">
                                                            <ActionIcon variant="light" color="green" radius="xl">
                                                                <IconCheck size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Tooltip label="Reject">
                                                            <ActionIcon variant="light" color="red" radius="xl">
                                                                <IconX size={16} />
                                                            </ActionIcon>
                                                        </Tooltip>
                                                        <Menu position="bottom-end" shadow="md">
                                                            <Menu.Target>
                                                                <ActionIcon variant="subtle" color="gray" radius="xl">
                                                                    <IconDotsVertical size={16} />
                                                                </ActionIcon>
                                                            </Menu.Target>
                                                            <Menu.Dropdown>
                                                                <Menu.Item>View Details</Menu.Item>
                                                                <Menu.Item color="blue">Adjust Balance</Menu.Item>
                                                            </Menu.Dropdown>
                                                        </Menu>
                                                    </Group>
                                                </Table.Td>
                                            </Table.Tr>
                                        ))}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        )}
                    </Paper>
                </Grid.Col>

                {/* Department Absence Summary */}
                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Paper p="lg" radius="md" withBorder style={{ height: "100%" }}>
                        <Group justify="space-between" mb="md">
                            <Title order={3} size="h4">
                                Department Status
                            </Title>
                            <ActionIcon variant="subtle" color="gray" component={Link} href="/team/departments">
                                <IconAdjustments size={16} />
                            </ActionIcon>
                        </Group>

                        <Text size="xs" c="dimmed" mb="lg">
                            Active absences proportion per department.
                        </Text>

                        {data.departmentOverview.length === 0 ? (
                            <Text ta="center" py="xl" c="dimmed" size="sm">
                                No departments found
                            </Text>
                        ) : (
                            <Stack gap="md">
                                {data.departmentOverview.map((dept, index) => (
                                    <Paper key={index} p="sm" radius="sm" withBorder bg="var(--mantine-color-gray-0)">
                                        <Group justify="space-between" align="center">
                                            <Box>
                                                <Text size="sm" fw={500}>
                                                    {dept.name}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {dept.count} members
                                                </Text>
                                            </Box>
                                            <Badge color={dept.onLeave > 3 ? "orange" : "gray"} variant="light">
                                                {dept.onLeave} on leave
                                            </Badge>
                                        </Group>
                                    </Paper>
                                ))}
                            </Stack>
                        )}


                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}