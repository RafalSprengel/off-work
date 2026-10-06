"use client";

import { useEffect, useState, type ReactNode } from "react";
import dayjs from "dayjs";
import isoWeek from "dayjs/plugin/isoWeek";
import "@mantine/charts/styles.css";
import {
    Center,
    Group,
    Loader,
    Paper,
    SimpleGrid,
    Stack,
    Table,
    Text,
    Title,
} from "@mantine/core";
import { BarChart } from "@mantine/charts";
import {
    IconChartBar,
    IconUsers,
    IconCalendarStats,
    IconReportAnalytics,
    IconStethoscope,
    IconCalendarDue,
} from "@tabler/icons-react";
import { getReportData } from "@/actions/manager/reports/getReportData";
import type { ReportDataItem, EmployeeReportItem } from "@/actions/manager/reports/getReportData";
import SortableHeader from "@/app/(app)/components/SortableHeader/SortableHeader";
import { sortItems, type SortDirection } from "@/utils/sort";

dayjs.extend(isoWeek);

function monthKey(d: string) { return dayjs(d).format("YYYY-MM"); }
function monthLabel(key: string) { return dayjs(key + "-01").format("MMM YY"); }
function isoWeekKey(d: string) { return dayjs(d).format("GGGG-[W]WW"); }
function formatTenure(days: number): string {
    const years = Math.floor(days / 365);
    const months = Math.floor((days % 365) / 30);
    if (years > 0) return `${years}y ${months}m`;
    if (months > 0) return `${months}m ${days % 30}d`;
    return `${days}d`;
}

interface TopEmployee { name: string; days: number; department?: string; }
interface DepartmentSick { department: string; days: number; }
interface EmployeeTenure { _id: string; name: string; departmentName?: string; employmentDate: string; tenureDays: number; }
interface DepartmentTurnover { department: string; active: number; inactive: number; total: number; turnoverRate: number; }

interface ReportColumn<T> {
    key: string;
    label: string;
    align?: "left" | "right";
    getValue: (row: T) => unknown;
    render: (row: T) => ReactNode;
}

function SortableReportTable<T>({
    columns,
    rows,
}: {
    columns: ReportColumn<T>[];
    rows: T[];
}) {
    const [sortColumn, setSortColumn] = useState<string | null>(null);
    const [sortDirection, setSortDirection] = useState<SortDirection>("asc");

    const handleSort = (key: string) => {
        if (sortColumn === key) {
            setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
        } else {
            setSortColumn(key);
            setSortDirection("asc");
        }
    };

    const sortedRows = sortColumn
        ? sortItems(
              rows,
              (row) => columns.find((c) => c.key === sortColumn)?.getValue(row),
              sortDirection,
          )
        : rows;

    return (
        <Table striped highlightOnHover>
            <Table.Thead>
                <Table.Tr>
                    {columns.map((col) => (
                        <Table.Th key={col.key} ta={col.align === "right" ? "right" : undefined}>
                            <SortableHeader
                                label={col.label}
                                active={sortColumn === col.key}
                                direction={sortDirection}
                                onSort={() => handleSort(col.key)}
                                align={col.align}
                            />
                        </Table.Th>
                    ))}
                </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
                {sortedRows.map((row, i) => (
                    <Table.Tr key={i}>
                        {columns.map((col) => (
                            <Table.Td key={col.key} ta={col.align === "right" ? "right" : undefined}>
                                {col.render(row)}
                            </Table.Td>
                        ))}
                    </Table.Tr>
                ))}
            </Table.Tbody>
        </Table>
    );
}

export default function ReportsPage() {
    const [loading, setLoading] = useState(true);
    const [requests, setRequests] = useState<ReportDataItem[]>([]);
    const [employees, setEmployees] = useState<EmployeeReportItem[]>([]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const res = await getReportData();
            if (res.success && res.data) {
                setRequests(res.data.leaveRequests);
                setEmployees(res.data.employees);
            }
            setLoading(false);
        })();
    }, []);

    if (loading) {
        return (
            <Center py="xl">
                <Loader />
            </Center>
        );
    }
    // ---- 1. Monthly chart data ----
    const monthlyMap = new Map<string, { sick: number; annual: number; unpaid: number; bereavement: number }>();
    for (const r of requests) {
        const mk = monthKey(r.startDate);
        if (!monthlyMap.has(mk)) monthlyMap.set(mk, { sick: 0, annual: 0, unpaid: 0, bereavement: 0 });
        const m = monthlyMap.get(mk)!;
        if (r.type === "sick") m.sick += r.daysRequested;
        else if (r.type === "annual") m.annual += r.daysRequested;
        else if (r.type === "unpaid") m.unpaid += r.daysRequested;
        else if (r.type === "bereavement") m.bereavement += r.daysRequested;
    }
    const sortedMonths = Array.from(monthlyMap.keys()).sort();
    const monthlyChartData = sortedMonths.map((mk) => ({
        month: monthLabel(mk),
        "Sick Leave": monthlyMap.get(mk)!.sick,
        "Annual Leave": monthlyMap.get(mk)!.annual,
        Unpaid: monthlyMap.get(mk)!.unpaid,
        Bereavement: monthlyMap.get(mk)!.bereavement,
    }));

    // ---- 2. Weekly sick ----
    const weeklyMap = new Map<string, number>();
    for (const r of requests) {
        if (r.type !== "sick") continue;
        const wk = isoWeekKey(r.startDate);
        weeklyMap.set(wk, (weeklyMap.get(wk) || 0) + r.daysRequested);
    }
    const topWeeks = Array.from(weeklyMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10)
        .map(([week, days]) => ({ week, days }));

    // ---- 3. Top sick employees ----
    const sickByEmployee = new Map<string, { name: string; days: number; dept?: string }>();
    for (const r of requests) {
        if (r.type !== "sick") continue;
        const key = r.employee || r.employeeName || "unknown";
        if (!sickByEmployee.has(key)) sickByEmployee.set(key, { name: r.employeeName || "Unknown", days: 0, dept: r.departmentName });
        sickByEmployee.get(key)!.days += r.daysRequested;
    }
    const topSickEmployees: TopEmployee[] = Array.from(sickByEmployee.values())
        .sort((a, b) => b.days - a.days).slice(0, 10);

    // ---- 4. Top annual employees ----
    const annualByEmployee = new Map<string, { name: string; days: number; dept?: string }>();
    for (const r of requests) {
        if (r.type !== "annual") continue;
        const key = r.employee || r.employeeName || "unknown";
        if (!annualByEmployee.has(key)) annualByEmployee.set(key, { name: r.employeeName || "Unknown", days: 0, dept: r.departmentName });
        annualByEmployee.get(key)!.days += r.daysRequested;
    }
    const topAnnualEmployees: TopEmployee[] = Array.from(annualByEmployee.values())
        .sort((a, b) => b.days - a.days).slice(0, 10);

    // ---- 5. Sick by dept ----
    const sickByDept = new Map<string, number>();
    for (const r of requests) {
        if (r.type !== "sick") continue;
        const dept = r.departmentName || "No Department";
        sickByDept.set(dept, (sickByDept.get(dept) || 0) + r.daysRequested);
    }
    const deptSickList: DepartmentSick[] = Array.from(sickByDept.entries())
        .map(([department, days]) => ({ department, days }))
        .sort((a, b) => b.days - a.days);
    // ---- 6. Tenure ----
    const now = dayjs();
    const tenureList: EmployeeTenure[] = employees
        .filter((e) => e.employmentDate && e.status === "active")
        .map((e) => {
            const start = dayjs(e.employmentDate);
            return {
                _id: e._id,
                name: `${e.firstName} ${e.lastName}`,
                departmentName: e.departmentName,
                employmentDate: e.employmentDate,
                tenureDays: now.diff(start, "day"),
            };
        })
        .sort((a, b) => b.tenureDays - a.tenureDays);
    const longestTenure = tenureList.slice(0, 5);
    const shortestTenure = tenureList.slice(-5).reverse();

    // ---- 7. Turnover ----
    const deptCount = new Map<string, { active: number; inactive: number; total: number }>();
    for (const e of employees) {
        const dept = e.departmentName || "No Department";
        if (!deptCount.has(dept)) deptCount.set(dept, { active: 0, inactive: 0, total: 0 });
        const d = deptCount.get(dept)!;
        d.total++;
        if (e.status === "active") d.active++;
        else if (e.status === "inactive") d.inactive++;
    }
    const turnoverData: DepartmentTurnover[] = Array.from(deptCount.entries())
        .map(([department, counts]) => ({
            department,
            ...counts,
            turnoverRate: counts.total > 0 ? Math.round((counts.inactive / counts.total) * 100) : 0,
        }))
        .sort((a, b) => b.turnoverRate - a.turnoverRate);
    return (
        <Stack gap="xl">
            <Title order={2}>Reports & Analytics</Title>
            {/* Section 1: Monthly chart */}
            <Paper p="md" radius="md" withBorder>
                <Group gap="xs" mb="md">
                    <IconCalendarStats size={22} />
                    <Title order={4}>Leave per Month</Title>
                </Group>
                {monthlyChartData.length === 0 ? (
                    <Text size="sm" c="dimmed">No approved leave data yet.</Text>
                ) : (
                    <BarChart
                        h={350}
                        data={monthlyChartData}
                        dataKey="month"
                        type="stacked"
                        series={[
                            { name: "Sick Leave", color: "red.6" },
                            { name: "Annual Leave", color: "blue.6" },
                            { name: "Unpaid", color: "yellow.6" },
                            { name: "Other", color: "gray.6" },
                        ]}
                        tickLine="y"
                        gridAxis="x"
                        withLegend
                        withTooltip
                        legendProps={{ verticalAlign: "bottom" }}
                        yAxisLabel="Days"
                    />
                )}
            </Paper>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {/* Section 2: Top sick weeks */}
                <Paper p="md" radius="md" withBorder>
                    <Group gap="xs" mb="md">
                        <IconStethoscope size={20} />
                        <Title order={4}>Top 10 Weeks - Sick Leave</Title>
                    </Group>
                    {topWeeks.length === 0 ? (
                        <Text size="sm" c="dimmed">No sick leave data.</Text>
                    ) : (
                        <BarChart
                            h={250}
                            data={topWeeks}
                            dataKey="week"
                            series={[{ name: "days", color: "red.6" }]}
                            tickLine="y"
                            gridAxis="x"
                            withTooltip
                        />
                    )}
                </Paper>

                {/* Section 3: Department sick leave */}
                <Paper p="md" radius="md" withBorder>
                    <Group gap="xs" mb="md">
                        <IconUsers size={20} />
                        <Title order={4}>Sick Leave by Department</Title>
                    </Group>
                    {deptSickList.length === 0 ? (
                        <Text size="sm" c="dimmed">No data.</Text>
                    ) : (
                        <BarChart
                            h={250}
                            data={deptSickList}
                            dataKey="department"
                            series={[{ name: "days", color: "red.6" }]}
                            tickLine="y"
                            gridAxis="x"
                            withTooltip
                        />
                    )}
                </Paper>
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {/* Section 4: Top employees - Sick */}
                <Paper p="md" radius="md" withBorder>
                    <Group gap="xs" mb="md">
                        <IconChartBar size={20} />
                        <Title order={4}>Most Sick Leave Taken</Title>
                    </Group>
                    {topSickEmployees.length === 0 ? (
                        <Text size="sm" c="dimmed">No data.</Text>
                    ) : (
                        <SortableReportTable
                            rows={topSickEmployees}
                            columns={[
                                { key: "name", label: "Employee", getValue: (e) => e.name, render: (e) => e.name },
                                { key: "department", label: "Department", getValue: (e) => e.department ?? "", render: (e) => e.department || "-" },
                                { key: "days", label: "Days", align: "right", getValue: (e) => e.days, render: (e) => e.days },
                            ]}
                        />
                    )}
                </Paper>

                {/* Section 5: Top employees - Annual */}
                <Paper p="md" radius="md" withBorder>
                    <Group gap="xs" mb="md">
                        <IconCalendarDue size={20} />
                        <Title order={4}>Most Annual Leave Taken</Title>
                    </Group>
                    {topAnnualEmployees.length === 0 ? (
                        <Text size="sm" c="dimmed">No data.</Text>
                    ) : (
                        <SortableReportTable
                            rows={topAnnualEmployees}
                            columns={[
                                { key: "name", label: "Employee", getValue: (e) => e.name, render: (e) => e.name },
                                { key: "department", label: "Department", getValue: (e) => e.department ?? "", render: (e) => e.department || "-" },
                                { key: "days", label: "Days", align: "right", getValue: (e) => e.days, render: (e) => e.days },
                            ]}
                        />
                    )}
                </Paper>
            </SimpleGrid>
            <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
                {/* Section 6: Longest working employees */}
                <Paper p="md" radius="md" withBorder>
                    <Group gap="xs" mb="md">
                        <IconReportAnalytics size={20} />
                        <Title order={4}>Longest Working Employees</Title>
                    </Group>
                    {longestTenure.length === 0 ? (
                        <Text size="sm" c="dimmed">No data.</Text>
                    ) : (
                        <SortableReportTable
                            rows={longestTenure}
                            columns={[
                                { key: "name", label: "Employee", getValue: (e) => e.name, render: (e) => e.name },
                                { key: "department", label: "Department", getValue: (e) => e.departmentName ?? "", render: (e) => e.departmentName || "-" },
                                { key: "tenure", label: "Tenure", align: "right", getValue: (e) => e.tenureDays, render: (e) => formatTenure(e.tenureDays) },
                            ]}
                        />
                    )}
                </Paper>

                {/* Section 7: Shortest working employees */}
                <Paper p="md" radius="md" withBorder>
                    <Group gap="xs" mb="md">
                        <IconReportAnalytics size={20} />
                        <Title order={4}>Shortest Working Employees</Title>
                    </Group>
                    {shortestTenure.length === 0 ? (
                        <Text size="sm" c="dimmed">No data.</Text>
                    ) : (
                        <SortableReportTable
                            rows={shortestTenure}
                            columns={[
                                { key: "name", label: "Employee", getValue: (e) => e.name, render: (e) => e.name },
                                { key: "department", label: "Department", getValue: (e) => e.departmentName ?? "", render: (e) => e.departmentName || "-" },
                                { key: "tenure", label: "Tenure", align: "right", getValue: (e) => e.tenureDays, render: (e) => formatTenure(e.tenureDays) },
                            ]}
                        />
                    )}
                </Paper>
            </SimpleGrid>
            {/* Section 8: Turnover */}
            <Paper p="md" radius="md" withBorder>
                <Group gap="xs" mb="md">
                    <IconUsers size={22} />
                    <Title order={4}>Employee Turnover by Department</Title>
                </Group>
                {turnoverData.length === 0 ? (
                    <Text size="sm" c="dimmed">No data.</Text>
                ) : (
                    <SortableReportTable
                        rows={turnoverData}
                        columns={[
                            { key: "department", label: "Department", getValue: (d) => d.department, render: (d) => d.department },
                            { key: "active", label: "Active", align: "right", getValue: (d) => d.active, render: (d) => d.active },
                            { key: "inactive", label: "Inactive", align: "right", getValue: (d) => d.inactive, render: (d) => d.inactive },
                            { key: "total", label: "Total", align: "right", getValue: (d) => d.total, render: (d) => d.total },
                            { key: "turnoverRate", label: "Turnover Rate", align: "right", getValue: (d) => d.turnoverRate, render: (d) => `${d.turnoverRate}%` },
                        ]}
                    />
                )}
            </Paper>
        </Stack>
    );
}