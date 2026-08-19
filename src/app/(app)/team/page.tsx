// src/app/(app)/team/page.tsx
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
import { useState } from "react";
import { useRouter } from "next/navigation";
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

// Helper function to safely get employee name
const getEmployeeName = (employee: any): string => {
    if (!employee) return "Employee has been deleted"
    const firstName = employee.firstName || ""
    const lastName = employee.lastName || ""
    return `${firstName} ${lastName}`.trim() || "Employee has been deleted"
}

// Helper function to safely get department name
const getDepartmentName = (employee: any): string => {
    if (!employee) return "No Department"
    if (!employee.department) return "No Department"
    if (typeof employee.department === 'object') {
        return employee.department.name || "No Department"
    }
    return "No Department"
}

export default function AdminDashboard() {
    const router = useRouter();
    const { data, loading } = useTeamDashboard()
    const [hoveredAbsenceId, setHoveredAbsenceId] = useState<string | null>(null);

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
    const pendingRequests = data.pendingRequests || []

    // Filter out requests with null employee (sieroty po usuniętym koncie)
    const validPendingRequests = pendingRequests.filter(
        (req) => req.employee !== null && req.employee !== undefined
    )
    const validTodayAbsences = todayAbsences.filter(
        (req) => req.employee !== null && req.employee !== undefined
    )

    return (
        <Stack gap="lg">
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

            <SimpleGrid cols={{ base: 2, md: 4 }} spacing="xs">
                <Paper p="sm" radius="md" withBorder>
                    <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
                        <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>
                            Total Employees
                        </Text>
                        <ThemeIcon variant="light" color="blue" size="sm" style={{ flexShrink: 0 }}>
                            <IconUsers size={14} />
                        </ThemeIcon>
                    </Group>
                    <Group align="baseline" gap="xs">
                        <Text size="lg" fw={700} lh={1}>
                            {data.totalEmployees}
                        </Text>
                        <Text size="xs" c="dimmed">
                            • {data.departmentOverview.length} depts
                        </Text>
                    </Group>
                </Paper>

                <Paper p="sm" radius="md" withBorder>
                    <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
                        <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>
                            Currently On Leave
                        </Text>
                        <ThemeIcon variant="light" color="teal" size="sm" style={{ flexShrink: 0 }}>
                            <IconCalendarStats size={14} />
                        </ThemeIcon>
                    </Group>
                    <Group align="baseline" gap="xs">
                        <Text size="lg" fw={700} lh={1}>
                            {data.activeOnLeave}
                        </Text>
                        <Text size="xs" c="dimmed">
                            • {data.totalEmployees > 0
                                ? `${((data.activeOnLeave / data.totalEmployees) * 100).toFixed(1)}%`
                                : "0%"}
                        </Text>
                    </Group>
                </Paper>

                <Paper p="sm" radius="md" withBorder>
                    <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
                        <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>
                            Pending Requests
                        </Text>
                        <ThemeIcon variant="light" color="orange" size="sm" style={{ flexShrink: 0 }}>
                            <IconClock size={14} />
                        </ThemeIcon>
                    </Group>
                    <Group align="baseline" gap="xs">
                        <Text size="lg" fw={700} lh={1}>
                            {data.pendingApprovals}
                        </Text>
                        <Text size="xs" c="dimmed">
                            • Action required
                        </Text>
                    </Group>
                </Paper>

                <Paper p="sm" radius="md" withBorder>
                    <Group justify="space-between" align="center" wrap="nowrap" mb={4}>
                        <Text size="xs" c="dimmed" fw={600} style={{ textTransform: "uppercase" }}>
                            On Leave This Week
                        </Text>
                        <ThemeIcon variant="light" color="red" size="sm" style={{ flexShrink: 0 }}>
                            <IconCalendarStats size={14} />
                        </ThemeIcon>
                    </Group>
                    <Group align="baseline" gap="xs">
                        <Text size="lg" fw={700} lh={1}>
                            {data.onLeaveThisWeek}
                        </Text>
                        <Text size="xs" c="dimmed">
                            • Approved
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

                        {validPendingRequests.length === 0 ? (
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
                                        {validPendingRequests.map((req) => {
                                            const fullName = getEmployeeName(req.employee);
                                            const deptName = getDepartmentName(req.employee);

                                            return (
                                                <Table.Tr
                                                    key={req._id}
                                                    onClick={() => router.push(`/team/leave-requests/${req._id}`)}
                                                    style={{ cursor: "pointer" }}
                                                >
                                                    <Table.Td>
                                                        <Group gap="sm" wrap="nowrap">
                                                            <Avatar
                                                                name={fullName}
                                                                radius="xl"
                                                                size="sm"
                                                                color="initials"
                                                            />
                                                            <Box>
                                                                <Text size="sm" fw={500}>
                                                                    {fullName}
                                                                </Text>
                                                                <Text size="xs" c="dimmed">
                                                                    {deptName}
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
                                                        <Group gap={4} wrap="nowrap" onClick={(e) => e.stopPropagation()}>
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
                                                                    <Menu.Item
                                                                        component={Link}
                                                                        href={`/team/leave-requests/${req._id}`}
                                                                    >
                                                                        View Details
                                                                    </Menu.Item>
                                                                    <Menu.Item color="blue">Adjust Balance</Menu.Item>
                                                                </Menu.Dropdown>
                                                            </Menu>
                                                        </Group>
                                                    </Table.Td>
                                                </Table.Tr>
                                            );
                                        })}
                                    </Table.Tbody>
                                </Table>
                            </Table.ScrollContainer>
                        )}
                    </Paper>
                </Grid.Col>

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

            <Paper p="lg" radius="md" withBorder>
                <Group justify="space-between" align="center" mb="md">
                    <Group gap="xs" align="center">
                        <IconCalendar size={22} />
                        <Title order={3} size="h4" fw={700}>
                            Absences for {todayStr}
                        </Title>
                    </Group>
                    <Badge variant="light" color="blue" size="lg" leftSection={<IconUsers size={14} />}>
                        {validTodayAbsences.length} ABSENCES
                    </Badge>
                </Group>

                {validTodayAbsences.length === 0 ? (
                    <Text ta="center" py="xl" c="dimmed">
                        No absences for today
                    </Text>
                ) : (
                    <Stack gap="sm">
                        {validTodayAbsences.map((absence) => {
                            const fullName = getEmployeeName(absence.employee);
                            const deptName = getDepartmentName(absence.employee);

                            return (
                                <Paper
                                    key={absence._id}
                                    p="md"
                                    radius="md"
                                    onClick={() => router.push(`/team/leave-requests/${absence._id}`)}
                                    onMouseEnter={() => setHoveredAbsenceId(absence._id)}
                                    onMouseLeave={() => setHoveredAbsenceId(null)}
                                    style={{
                                        border: "1px solid var(--mantine-color-gray-3)",
                                        backgroundColor:
                                            hoveredAbsenceId === absence._id
                                                ? "var(--mantine-color-gray-1)"
                                                : "var(--mantine-color-gray-0)",
                                        cursor: "pointer",
                                        transition: "background-color 100ms ease",
                                    }}
                                >
                                    <Group justify="space-between" align="center">
                                        <Group gap="md">
                                            <Avatar
                                                name={fullName}
                                                radius="xl"
                                                size="md"
                                                color="blue"
                                                variant="light"
                                            />
                                            <Box>
                                                <Text size="sm" fw={700}>
                                                    {fullName}
                                                </Text>
                                                <Text size="xs" c="dimmed">
                                                    {deptName} • {typeLabels[absence.type] ?? absence.type}
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
                            );
                        })}
                    </Stack>
                )}
            </Paper>
        </Stack>
    )
}