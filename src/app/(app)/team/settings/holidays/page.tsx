"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Group,
    Loader,
    Menu,
    Select,
    Stack,
    Switch,
    Text,
    Title,
} from "@mantine/core";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconChevronDown, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";

import { getClosureDays, type ClosureDayItem } from "@/actions/admin/closureDays/getClosureDays";
import { importUkBankHolidays } from "@/actions/admin/closureDays/importUkBankHolidays";
import { toggleClosureDay } from "@/actions/admin/closureDays/toggleClosureDay";
import { deleteClosureDay } from "@/actions/admin/closureDays/deleteClosureDay";
import { clearBankHolidays } from "@/actions/admin/closureDays/clearBankHolidays";
import type { UkBankHolidayRegion } from "@/db/models/ClosureDay";

const REGION_LABELS: Record<UkBankHolidayRegion, string> = {
    "england-and-wales": "England & Wales",
    scotland: "Scotland",
    "northern-ireland": "Northern Ireland",
};

export default function PublicHolidaysPage() {
    const [holidays, setHolidays] = useState<ClosureDayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [importingRegion, setImportingRegion] = useState<UkBankHolidayRegion | null>(null);
    const [clearing, setClearing] = useState(false);
    const [isPending, startTransition] = useTransition();
    const [selectedYear, setSelectedYear] = useState<string | null>(null);

    const loadHolidays = async () => {
        setLoading(true);
        const fromDate = dayjs().startOf("year").format("YYYY-MM-DD");
        const res = await getClosureDays("bank_holiday", fromDate);
        if (res.success) {
            setHolidays(res.data);
        } else {
            notifications.show({
                color: "red",
                title: "Failed to load holidays",
                message: res.error ?? "Unknown error",
            });
        }
        setLoading(false);
    };

    useEffect(() => {
        loadHolidays();
    }, []);

    const { yearOptions, countsByYear } = useMemo(() => {
        const yearsSet = new Set<number>();
        const counts: Record<number, number> = {};

        holidays.forEach((h) => {
            const year = dayjs(h.date).year();
            yearsSet.add(year);
            counts[year] = (counts[year] ?? 0) + 1;
        });

        const years = Array.from(yearsSet).sort((a, b) => a - b);

        const options = [
            { value: "all", label: `All years (${holidays.length} total)` },
            ...years.map((y) => ({
                value: String(y),
                label: `${y} (${counts[y] ?? 0} holidays)`,
            })),
        ];

        return { yearOptions: options, countsByYear: counts };
    }, [holidays]);

    useEffect(() => {
        if (holidays.length > 0 && selectedYear === null) {
            const currentYear = dayjs().year();
            const availableYears = Object.keys(countsByYear).map(Number);

            if (availableYears.includes(currentYear)) {
                setSelectedYear(String(currentYear));
            } else if (availableYears.length > 0) {
                const future = availableYears.filter((y) => y >= currentYear);
                setSelectedYear(String(future[0] ?? availableYears[availableYears.length - 1]));
            }
        }
    }, [holidays, countsByYear, selectedYear]);

    const filteredHolidays = useMemo(() => {
        if (!selectedYear || selectedYear === "all") return holidays;
        const year = parseInt(selectedYear, 10);
        return holidays.filter((h) => dayjs(h.date).year() === year);
    }, [holidays, selectedYear]);

    const groupedByYear = useMemo(() => {
        const groups: Record<number, ClosureDayItem[]> = {};
        filteredHolidays.forEach((h) => {
            const year = dayjs(h.date).year();
            if (!groups[year]) groups[year] = [];
            groups[year].push(h);
        });
        return Object.entries(groups)
            .sort(([a], [b]) => Number(a) - Number(b))
            .map(([year, items]) => ({ year: Number(year), items }));
    }, [filteredHolidays]);

    const handleImport = async (region: UkBankHolidayRegion) => {
        setImportingRegion(region);
        const res = await importUkBankHolidays(region);
        setImportingRegion(null);

        if (!res.success) {
            notifications.show({
                color: "red",
                title: "Import failed",
                message: res.error ?? "Unknown error",
            });
            return;
        }

        notifications.show({
            color: "green",
            title: `${REGION_LABELS[region]} imported`,
            message: `${res.imported} new holidays added, ${res.skipped} already existed.`,
        });

        await loadHolidays();
    };

    const handleClearAll = () => {
        modals.openConfirmModal({
            title: "Clear all bank holidays",
            children: (
                <Text size="sm">
                    This will permanently remove <Text component="span" fw={600}>{holidays.length}</Text> bank
                    holiday(s) from your organization. This cannot be undone.
                </Text>
            ),
            labels: { confirm: "Clear All", cancel: "Cancel" },
            confirmProps: { color: "red", leftSection: <IconTrash size={16} /> },
            onConfirm: async () => {
                setClearing(true);
                const res = await clearBankHolidays();
                setClearing(false);

                if (res.success) {
                    notifications.show({
                        color: "green",
                        title: "Bank holidays cleared",
                        message: `${res.deletedCount} holiday(s) removed successfully.`,
                    });
                    await loadHolidays();
                } else {
                    notifications.show({
                        color: "red",
                        title: "Failed to clear holidays",
                        message: res.error ?? "Unknown error",
                    });
                }
            },
        });
    };

    const handleToggle = (id: string, enabled: boolean) => {
        setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, enabled } : h)));

        startTransition(async () => {
            const res = await toggleClosureDay(id, enabled);
            if (!res.success) {
                setHolidays((prev) => prev.map((h) => (h.id === id ? { ...h, enabled: !enabled } : h)));
                notifications.show({
                    color: "red",
                    title: "Failed to update holiday",
                    message: res.error ?? "Unknown error",
                });
            }
        });
    };

    const handleDelete = (id: string, title: string) => {
        modals.openConfirmModal({
            title: "Remove holiday",
            children: <Text size="sm">Remove "{title}" from the list? This cannot be undone.</Text>,
            labels: { confirm: "Remove", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => {
                setHolidays((prev) => prev.filter((h) => h.id !== id));
                startTransition(async () => {
                    const res = await deleteClosureDay(id);
                    if (!res.success) {
                        notifications.show({
                            color: "red",
                            title: "Failed to remove holiday",
                            message: res.error ?? "Unknown error",
                        });
                        await loadHolidays();
                    }
                });
            },
        });
    };

    return (
        <Stack gap="md" style={{ maxWidth: 700 }}>
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
                <Title order={4} m={0}>
                    Configured Bank Holidays
                </Title>

                <Group gap="xs" wrap="wrap">
                    <Select
                        size="xs"
                        placeholder="Select year"
                        data={yearOptions}
                        value={selectedYear}
                        onChange={setSelectedYear}
                        style={{ minWidth: 180 }}
                        disabled={loading || holidays.length === 0}
                    />

                    <Button
                        size="xs"
                        variant="outline"
                        color="red"
                        leftSection={<IconTrash size={14} />}
                        onClick={handleClearAll}
                        disabled={holidays.length === 0 || loading || clearing}
                        loading={clearing}
                    >
                        Clear All
                    </Button>

                    <Menu shadow="md" width={200} disabled={importingRegion !== null}>
                        <Menu.Target>
                            <Button
                                size="xs"
                                variant="outline"
                                rightSection={
                                    importingRegion ? <Loader size={12} /> : <IconChevronDown size={14} />
                                }
                            >
                                Import UK bank holidays
                            </Button>
                        </Menu.Target>
                        <Menu.Dropdown>
                            {(Object.keys(REGION_LABELS) as UkBankHolidayRegion[]).map((region) => (
                                <Menu.Item key={region} onClick={() => handleImport(region)}>
                                    {REGION_LABELS[region]}
                                </Menu.Item>
                            ))}
                        </Menu.Dropdown>
                    </Menu>
                </Group>
            </Group>

            {loading ? (
                <Group justify="center" py="xl">
                    <Loader size="sm" />
                </Group>
            ) : holidays.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                    No bank holidays configured yet. Import them from the menu above.
                </Text>
            ) : filteredHolidays.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                    No bank holidays found for the selected year.
                </Text>
            ) : (
                <Stack gap="lg">
                    {groupedByYear.map(({ year, items }) => (
                        <Stack key={year} gap="xs">
                            {selectedYear === "all" && (
                                <Group gap="xs">
                                    <Text size="lg" fw={700}>
                                        {year}
                                    </Text>
                                    <Badge variant="light" size="sm">
                                        {items.length} holidays
                                    </Badge>
                                </Group>
                            )}
                            <Stack gap="xs">
                                {items.map((h) => (
                                    <Card
                                        key={h.id}
                                        p="xs"
                                        radius="sm"
                                        withBorder
                                        bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                                    >
                                        <Group justify="space-between" wrap="nowrap">
                                            <div style={{ minWidth: 0 }}>
                                                <Group gap="xs" wrap="wrap">
                                                    <Text size="sm" fw={600}>
                                                        {h.title}
                                                    </Text>
                                                    {h.region && (
                                                        <Badge size="xs" variant="light">
                                                            {REGION_LABELS[h.region as UkBankHolidayRegion] ?? h.region}
                                                        </Badge>
                                                    )}
                                                    {!h.enabled && (
                                                        <Badge size="xs" variant="outline" color="gray">
                                                            Disabled
                                                        </Badge>
                                                    )}
                                                </Group>
                                                <Text size="xs" c="dimmed">
                                                    {dayjs(h.date).format("D MMMM YYYY (dddd)")}
                                                </Text>
                                            </div>

                                            <Group gap="xs" wrap="nowrap">
                                                <Switch
                                                    checked={h.enabled}
                                                    onChange={(event) => handleToggle(h.id, event.currentTarget.checked)}
                                                />
                                                <ActionIcon
                                                    color="red"
                                                    variant="subtle"
                                                    onClick={() => handleDelete(h.id, h.title)}
                                                >
                                                    <IconTrash size={16} />
                                                </ActionIcon>
                                            </Group>
                                        </Group>
                                    </Card>
                                ))}
                            </Stack>
                        </Stack>
                    ))}
                </Stack>
            )}
        </Stack>
    );
}