"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Group,
    Loader,
    Modal,
    Stack,
    Switch,
    Text,
    TextInput,
    Title,
    useMatches,
} from "@mantine/core";
import { DatePicker } from "@mantine/dates";
import { modals } from "@mantine/modals";
import { notifications } from "@mantine/notifications";
import { IconPlus, IconTrash } from "@tabler/icons-react";
import dayjs from "dayjs";

import { getClosureDays, type ClosureDayItem } from "@/actions/admin/closureDays/getClosureDays";
import { createClosureDay } from "@/actions/admin/closureDays/createClosureDay";
import { toggleClosureDay } from "@/actions/admin/closureDays/toggleClosureDay";
import { deleteClosureDay } from "@/actions/admin/closureDays/deleteClosureDay";

export default function FactoryClosuresPage() {
    const [closures, setClosures] = useState<ClosureDayItem[]>([]);
    const [bankHolidays, setBankHolidays] = useState<ClosureDayItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalOpened, setModalOpened] = useState(false);
    const [selectedDate, setSelectedDate] = useState<Date | null>(null);
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [isPending, startTransition] = useTransition();

    // Responsywne wartości
    const isMobile = useMatches({ base: true, sm: false });
    const dayHeight = useMatches({ base: 46, sm: 54 });
    const calendarSize = useMatches<"md" | "lg">({ base: "md", sm: "lg" });
    const titleFontSize = useMatches({ base: "8px", sm: "10px" });
    const maxWidth = useMatches({ base: "100%", sm: 800 });

    const loadData = async () => {
        setLoading(true);
        const [closuresRes, holidaysRes] = await Promise.all([
            getClosureDays("company_closure"),
            getClosureDays("bank_holiday"),
        ]);
        if (closuresRes.success) {
            setClosures(closuresRes.data);
        }
        if (holidaysRes.success) {
            setBankHolidays(holidaysRes.data.filter((h) => h.enabled));
        }
        setLoading(false);
    };

    useEffect(() => {
        loadData();
    }, []);

    const bankHolidaysMap = useMemo(() => {
        const map = new Map<string, string>();
        bankHolidays.forEach((h) => map.set(h.date, h.title));
        return map;
    }, [bankHolidays]);

    const closuresMap = useMemo(() => {
        const map = new Map<string, string>();
        closures.filter((c) => c.enabled).forEach((c) => map.set(c.date, c.title));
        return map;
    }, [closures]);

    const parseDate = (date: Date | string) => dayjs(date);
    const isWeekend = (date: Date | string) => {
        const d = parseDate(date).day();
        return d === 0 || d === 6;
    };
    const isBankHoliday = (date: Date | string) =>
        bankHolidaysMap.has(parseDate(date).format("YYYY-MM-DD"));
    const isClosure = (date: Date | string) =>
        closuresMap.has(parseDate(date).format("YYYY-MM-DD"));

    const openAddModal = () => {
        setSelectedDate(null);
        setTitle("");
        setModalOpened(true);
    };

    const handleSave = async () => {
        if (!selectedDate) {
            notifications.show({ color: "red", title: "Error", message: "Please select a date." });
            return;
        }
        if (!title.trim()) {
            notifications.show({ color: "red", title: "Error", message: "Please enter a title." });
            return;
        }

        setSaving(true);
        const res = await createClosureDay({
            date: dayjs(selectedDate).format("YYYY-MM-DD"),
            title: title.trim(),
        });
        setSaving(false);

        if (res.success) {
            notifications.show({
                color: "green",
                title: "Closure day added",
                message: `${title.trim()} on ${dayjs(selectedDate).format("D MMMM YYYY")}`,
            });
            setModalOpened(false);
            await loadData();
        } else {
            notifications.show({ color: "red", title: "Failed", message: res.error ?? "Unknown error" });
        }
    };

    const handleToggle = (id: string, enabled: boolean) => {
        setClosures((prev) => prev.map((c) => (c.id === id ? { ...c, enabled } : c)));

        startTransition(async () => {
            const res = await toggleClosureDay(id, enabled);
            if (!res.success) {
                setClosures((prev) =>
                    prev.map((c) => (c.id === id ? { ...c, enabled: !enabled } : c))
                );
                notifications.show({ color: "red", title: "Failed", message: res.error ?? "Unknown error" });
            }
        });
    };

    const handleDelete = (id: string, closureTitle: string) => {
        modals.openConfirmModal({
            title: "Remove closure day",
            children: <Text size="sm">Remove "{closureTitle}"? This cannot be undone.</Text>,
            labels: { confirm: "Remove", cancel: "Cancel" },
            confirmProps: { color: "red" },
            onConfirm: () => {
                setClosures((prev) => prev.filter((c) => c.id !== id));
                startTransition(async () => {
                    const res = await deleteClosureDay(id);
                    if (!res.success) {
                        notifications.show({
                            color: "red",
                            title: "Failed",
                            message: res.error ?? "Unknown error",
                        });
                        await loadData();
                    }
                });
            },
        });
    };

    const renderDayCell = (date: Date | string) => {
        const formattedDate = parseDate(date).format("YYYY-MM-DD");
        const holidayTitle = bankHolidaysMap.get(formattedDate);
        const closureTitle = closuresMap.get(formattedDate);
        const displayTitle = holidayTitle || closureTitle;

        return (
            <div
                style={{
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    justifyContent: "flex-start",
                    width: "100%",
                    height: "100%",
                    paddingTop: 2,
                    paddingBottom: 1,
                    boxSizing: "border-box",
                    overflow: "hidden",
                }}
            >
                <Text size="xs" fw={600} lh={1.2}>
                    {parseDate(date).date()}
                </Text>
                {displayTitle && (
                    <Text
                        style={{
                            fontSize: titleFontSize,
                            lineHeight: 1.1,
                            textAlign: "center",
                            marginTop: 1,
                            width: "100%",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                            paddingLeft: 1,
                            paddingRight: 1,
                            color: holidayTitle
                                ? "var(--mantine-color-blue-8)"
                                : "var(--mantine-color-orange-8)",
                        }}
                        title={displayTitle}
                    >
                        {displayTitle}
                    </Text>
                )}
            </div>
        );
    };

    return (
        <Stack gap="md" style={{ maxWidth }}>
            {/* Header - na mobile układa się w kolumnę */}
            <Group justify="space-between" align="center" wrap={isMobile ? "wrap" : "nowrap"} gap="sm">
                <Title order={isMobile ? 5 : 4} m={0}>
                    Factory Closure Days
                </Title>
                <Button
                    size="xs"
                    leftSection={<IconPlus size={14} />}
                    onClick={openAddModal}
                    fullWidth={isMobile}
                >
                    Add Closure Day
                </Button>
            </Group>

            {/* Kalendarz */}
            <Card p={isMobile ? "xs" : "md"} radius="sm" withBorder >
                <Text size="sm" fw={500} mb="xs">
                    Closure Calendar
                </Text>
                <div style={{ overflowX: "auto", overflowY: "hidden" }}>
                    <Group justify="center" wrap="nowrap">
                        <DatePicker
                            value={null}
                            onChange={() => { }}
                            size={calendarSize}
                            styles={{
                                day: {
                                    height: dayHeight,
                                },
                            }}
                            getDayProps={(date) => ({
                                disabled: isWeekend(date),
                                style: {
                                    backgroundColor: isBankHoliday(date)
                                        ? "var(--mantine-color-blue-1)"
                                        : isClosure(date)
                                            ? "var(--mantine-color-orange-1)"
                                            : undefined,
                                },
                            })}
                            renderDay={renderDayCell}
                        />
                    </Group>
                </div>

                {/* Legenda */}
                <Group gap="sm" mt="xs" wrap="wrap" justify="center">
                    <Group gap={4} wrap="nowrap">
                        <div
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: 3,
                                backgroundColor: "var(--mantine-color-blue-3)",
                                flexShrink: 0,
                            }}
                        />
                        <Text size="xs" c="dimmed">
                            Bank Holiday
                        </Text>
                    </Group>
                    <Group gap={4} wrap="nowrap">
                        <div
                            style={{
                                width: 12,
                                height: 12,
                                borderRadius: 3,
                                backgroundColor: "var(--mantine-color-orange-3)",
                                flexShrink: 0,
                            }}
                        />
                        <Text size="xs" c="dimmed">
                            Factory Closure
                        </Text>
                    </Group>
                </Group>
            </Card>

            {/* Lista closure days */}
            {loading ? (
                <Group justify="center" py="xl">
                    <Loader size="sm" />
                </Group>
            ) : closures.length === 0 ? (
                <Text size="sm" c="dimmed" ta="center" py="xl">
                    No factory closure days yet. Add one using the button above.
                </Text>
            ) : (
                <Stack gap="xs">
                    {closures.map((c) => (
                        <Card
                            key={c.id}
                            p="xs"
                            radius="sm"
                            withBorder
                            bg="light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-6))"
                        >
                            <Group justify="space-between" wrap="nowrap" gap="xs">
                                <div style={{ minWidth: 0, flex: 1 }}>
                                    <Group gap="xs" wrap="wrap">
                                        <Text size="sm" fw={600} truncate>
                                            {c.title}
                                        </Text>
                                        {!c.enabled && (
                                            <Badge size="xs" variant="outline" color="gray">
                                                Disabled
                                            </Badge>
                                        )}
                                    </Group>
                                    <Text size="xs" c="dimmed" truncate>
                                        {dayjs(c.date).format(isMobile ? "D MMM YYYY (ddd)" : "D MMMM YYYY (dddd)")}
                                    </Text>
                                </div>
                                <Group gap="xs" wrap="nowrap" style={{ flexShrink: 0 }}>
                                    <Switch
                                        checked={c.enabled}
                                        onChange={(e) => handleToggle(c.id, e.currentTarget.checked)}
                                        size={isMobile ? "xs" : "sm"}
                                    />
                                    <ActionIcon
                                        color="red"
                                        variant="subtle"
                                        onClick={() => handleDelete(c.id, c.title)}
                                        size={isMobile ? "sm" : "md"}
                                    >
                                        <IconTrash size={isMobile ? 14 : 16} />
                                    </ActionIcon>
                                </Group>
                            </Group>
                        </Card>
                    ))}
                </Stack>
            )}

            {/* Modal dodawania */}
            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Add Factory Closure Day"
                centered
                fullScreen={isMobile}
                transitionProps={{ transition: isMobile ? "slide-up" : "fade" }}
            >
                <Stack gap="md">
                    <div style={{ overflowX: "auto" }}>
                        <Group justify="center" wrap="nowrap">
                            <DatePicker
                                value={selectedDate}
                                onChange={setSelectedDate}
                                size="sm"
                                styles={{
                                    day: {
                                        height: 42,
                                    },
                                }}
                                getDayProps={(date) => ({
                                    disabled: isWeekend(date) || isBankHoliday(date) || isClosure(date),
                                })}
                                renderDay={renderDayCell}
                            />
                        </Group>
                    </div>
                    <TextInput
                        label="Closure Title"
                        placeholder="e.g. Annual maintenance shutdown"
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                    />
                    <Group justify="flex-end" gap="xs">
                        <Button variant="light" onClick={() => setModalOpened(false)} disabled={saving}>
                            Cancel
                        </Button>
                        <Button onClick={handleSave} loading={saving}>
                            Add Closure Day
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}