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
} from "@mantine/core"
import {
    IconUsers,
    IconClock,
    IconCheck,
    IconX,
    IconDotsVertical,
    IconBuildingHospital,
    IconUserPlus,
    IconSettings,
    IconCalendarStats,
    IconChevronRight,
    IconAdjustments,
} from "@tabler/icons-react"
import Link from "next/link"

export default function AdminDashboard() {
    const companyStats = {
        totalEmployees: 142,
        activeOnLeave: 12,
        pendingApprovals: 8,
        sickLeavesToday: 3,
    }

    const pendingRequests = [
        {
            id: "REQ-109",
            employee: "Alex Morgan",
            department: "Engineering",
            type: "Annual Leave",
            dates: "20 Aug 2026 - 28 Aug 2026",
            days: 7,
            submitted: "1 hour ago",
            avatar: "https://avatar.vercel.sh/alex",
        },
        {
            id: "REQ-108",
            employee: "David Kim",
            department: "Design",
            type: "Sick Leave",
            dates: "13 Aug 2026 - 14 Aug 2026",
            days: 2,
            submitted: "3 hours ago",
            avatar: "https://avatar.vercel.sh/david",
        },
        {
            id: "REQ-107",
            employee: "Sophia Chen",
            department: "Marketing",
            type: "Maternity Leave",
            dates: "01 Sep 2026 - 01 Dec 2026",
            days: 90,
            submitted: "1 day ago",
            avatar: "https://avatar.vercel.sh/sophia",
        },
        {
            id: "REQ-105",
            employee: "James Wilson",
            department: "Sales",
            type: "Unpaid Leave",
            dates: "25 Aug 2026 - 26 Aug 2026",
            days: 2,
            submitted: "2 days ago",
            avatar: "https://avatar.vercel.sh/james",
        },
    ]

    const departmentOverview = [
        { name: "Engineering", count: 45, onLeave: 5 },
        { name: "Product & Design", count: 22, onLeave: 2 },
        { name: "Sales & Marketing", count: 38, onLeave: 4 },
        { name: "HR & Finance", count: 14, onLeave: 1 },
    ]

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
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>
                            Total Employees
                        </Text>
                        <ThemeIcon variant="light" color="blue">
                            <IconUsers size={16} />
                        </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700}>
                        {companyStats.totalEmployees}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        Across 4 departments
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>
                            Currently On Leave
                        </Text>
                        <ThemeIcon variant="light" color="teal">
                            <IconCalendarStats size={16} />
                        </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700}>
                        {companyStats.activeOnLeave}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        8.4% of total workforce
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>
                            Pending Requests
                        </Text>
                        <ThemeIcon variant="light" color="orange">
                            <IconClock size={16} />
                        </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700}>
                        {companyStats.pendingApprovals}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        Requires manager action
                    </Text>
                </Paper>

                <Paper p="md" radius="md" withBorder>
                    <Group justify="space-between" mb="xs">
                        <Text size="sm" c="dimmed" fw={500}>
                            Sick Leaves Today
                        </Text>
                        <ThemeIcon variant="light" color="red">
                            <IconBuildingHospital size={16} />
                        </ThemeIcon>
                    </Group>
                    <Text size="xl" fw={700}>
                        {companyStats.sickLeavesToday}
                    </Text>
                    <Text size="xs" c="dimmed" mt={4}>
                        Reported this morning
                    </Text>
                </Paper>
            </SimpleGrid>

            {/* Main Content Grid */}
            <Grid spacing="md">
                {/* Pending Leave Requests Table */}
                <Grid.Col span={{ base: 12, lg: 8 }}>
                    <Paper p="lg" radius="md" withBorder>
                        <Group justify="space-between" mb="md">
                            <Box>
                                <Title order={3} size="h4">
                                    All Pending Leave Requests
                                </Title>
                                <Text size="sm" c="dimmed">
                                    Review and override company-wide time off requests
                                </Text>
                            </Box>
                            <Button
                                component={Link}
                                href="/admin/requests"
                                variant="subtle"
                                size="xs"
                                rightSection={<IconChevronRight size={14} />}
                            >
                                View All ({companyStats.pendingApprovals})
                            </Button>
                        </Group>

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
                                    {pendingRequests.map((req) => (
                                        <Table.Tr key={req.id}>
                                            <Table.Td>
                                                <Group gap="sm" wrap="nowrap">
                                                    <Avatar src={req.avatar} radius="xl" size="sm" />
                                                    <Box>
                                                        <Text size="sm" fw={500}>
                                                            {req.employee}
                                                        </Text>
                                                        <Text size="xs" c="dimmed">
                                                            {req.department}
                                                        </Text>
                                                    </Box>
                                                </Group>
                                            </Table.Td>
                                            <Table.Td>
                                                <Badge variant="light" color="blue" size="sm">
                                                    {req.type}
                                                </Badge>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm">{req.dates}</Text>
                                                <Text size="xs" c="dimmed">
                                                    Submitted {req.submitted}
                                                </Text>
                                            </Table.Td>
                                            <Table.Td>
                                                <Text size="sm" fw={500}>
                                                    {req.days}d
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
                    </Paper>
                </Grid.Col>

                {/* Department Absence Summary */}
                <Grid.Col span={{ base: 12, lg: 4 }}>
                    <Paper p="lg" radius="md" withBorder style={{ height: "100%" }}>
                        <Group justify="space-between" mb="md">
                            <Title order={3} size="h4">
                                Department Status
                            </Title>
                            <ActionIcon variant="subtle" color="gray">
                                <IconAdjustments size={16} />
                            </ActionIcon>
                        </Group>

                        <Text size="xs" c="dimmed" mb="lg">
                            Active absences proportion per department.
                        </Text>

                        <Stack gap="md">
                            {departmentOverview.map((dept, index) => (
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

                        <Button
                            component={Link}
                            href="/admin/departments"
                            variant="outline"
                            color="gray"
                            fullWidth
                            mt="xl"
                            size="xs"
                        >
                            Manage Departments
                        </Button>
                    </Paper>
                </Grid.Col>
            </Grid>
        </Stack>
    )
}