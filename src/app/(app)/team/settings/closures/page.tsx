"use client";

import { useEffect, useMemo, useState, useTransition } from "react";
import {
    ActionIcon,
    Badge,
    Button,
    Card,
    Flex,
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
    const [selectedDate, setSelectedDate] = useState<string | null>(null);
    const [title, setTitle] = useState("");
    const [saving, setSaving] = useState(false);
    const [isPending, startTransition] = useTransition();

    const isMobile = useMatches({ base: true, sm: false });
    const calendarSize = useMatches<"sm" | "md">({ base: "md", md: "md" });
    const containerMaxWidth = useMatches({ base: "100%", sm: 800 });
    const cardPadding = useMatches({ base: "xs", sm: "md" });

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
            notifications.show({
                color: "red",
                title: "Error",
                message: "Please select a date.",
            });
            return;
        }
        if (!title.trim()) {
            notifications.show({
                color: "red",
                title: "Error",
                message: "Please enter a title.",
            });
            return;
        }

        setSaving(true);
        const formatted = dayjs(selectedDate).format("YYYY-MM-DD");
        const res = await createClosureDay({
            date: formatted,
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
            notifications.show({
                color: "red",
                title: "Failed",
                message: res.error ?? "Unknown error",
            });
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
                notifications.show({
                    color: "red",
                    title: "Failed",
                    message: res.error ?? "Unknown error",
                });
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
        const dayObj = parseDate(date);
        const dayNum = dayObj.date();
        const formattedDate = dayObj.format("YYYY-MM-DD");
        const holidayTitle = bankHolidaysMap.get(formattedDate);
        const closureTitle = closuresMap.get(formattedDate);
        const displayTitle = holidayTitle || closureTitle;
        const isHol = !!holidayTitle;
        const isClo = !!closureTitle;

        return (
            <Flex
                direction="column"
                align="center"
                justify="center"
                style={{ height: "100%", width: "100%" }}
            >
                <Text size="xs" lh={1} fw={isHol || isClo ? 700 : 400}>
                    {dayNum}
                </Text>
                {(isHol || isClo) && displayTitle && (
                    <Text
                        size="7px"
                        lh={1.1}
                        ta="center"
                        mt={2}
                        style={{
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            width: "100%",
                            paddingLeft: 1,
                            paddingRight: 1,
                            color: isHol
                                ? "var(--mantine-color-green-9)"
                                : "var(--mantine-color-orange-9)",
                        }}
                        title={displayTitle}
                    >
                        {displayTitle}
                    </Text>
                )}
            </Flex>
        );
    };

    const getDayPropsMain = (date: string) => {
        const hol = isBankHoliday(date);
        const clo = isClosure(date);

        if (hol) {
            return {
                disabled: isWeekend(date),
                style: {
                    backgroundColor: "var(--mantine-color-green-1)",
                    color: "var(--mantine-color-green-9)",
                    fontWeight: "bold",
                    borderRadius: "8px",
                },
            };
        }

        if (clo) {
            return {
                disabled: isWeekend(date),
                style: {
                    backgroundColor: "var(--mantine-color-orange-1)",
                    color: "var(--mantine-color-orange-9)",
                    fontWeight: "bold",
                    borderRadius: "8px",
                },
            };
        }

        return {
            disabled: isWeekend(date),
        };
    };

    const getDayPropsModal = (date: string) => {
        const hol = isBankHoliday(date);
        const clo = isClosure(date);
        const weekend = isWeekend(date);

        if (hol) {
            return {
                disabled: true,
                style: {
                    backgroundColor: "var(--mantine-color-green-1)",
                    color: "var(--mantine-color-green-9)",
                    fontWeight: "bold",
                    borderRadius: "8px",
                },
            };
        }

        if (clo) {
            return {
                disabled: true,
                style: {
                    backgroundColor: "var(--mantine-color-orange-1)",
                    color: "var(--mantine-color-orange-9)",
                    fontWeight: "bold",
                    borderRadius: "8px",
                },
            };
        }

        return {
            disabled: weekend,
        };
    };

    return (
        <Stack gap="md" style={{ maxWidth: containerMaxWidth }}>
            <Group
                justify="space-between"
                align="center"
                wrap={isMobile ? "wrap" : "nowrap"}
                gap="sm"
            >
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

            <Card p={cardPadding} radius="sm" withBorder style={{ overflow: "hidden" }}>
                <Stack align="center">
                    <Text size="sm" fw={500} mb="xs">
                        Closure Calendar
                    </Text>

                    <DatePicker
                        value={null}
                        onChange={() => { }}
                        size={calendarSize}
                        getDayProps={getDayPropsMain}
                        renderDay={renderDayCell}
                    />

                    <Group gap="sm" mt="xs" wrap="wrap" justify="center">
                        <Group gap={4} wrap="nowrap">
                            <div
                                style={{
                                    width: 12,
                                    height: 12,
                                    borderRadius: 3,
                                    backgroundColor: "var(--mantine-color-green-3)",
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
                </Stack>
            </Card>

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
                                        {dayjs(c.date).format(
                                            isMobile ? "D MMM YYYY (ddd)" : "D MMMM YYYY (dddd)"
                                        )}
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

            <Modal
                opened={modalOpened}
                onClose={() => setModalOpened(false)}
                title="Add Factory Closure Day"
                centered
                padding={isMobile ? "sm" : "lg"}
                radius={isMobile ? 0 : "md"}
                fullScreen={isMobile}
                transitionProps={{
                    transition: isMobile ? "slide-up" : "fade",
                }}
            >
                <Stack gap="md" align="stretch">
                    <Flex justify="center" align="center" style={{ width: "100%" }}>
                        <DatePicker
                            value={selectedDate}
                            onChange={setSelectedDate}
                            size={isMobile ? "sm" : "md"}
                            getDayProps={getDayPropsModal}
                            renderDay={renderDayCell}
                        />
                    </Flex>

                    {selectedDate && (
                        <Text size="xs" c="blue" ta="center" fw={500}>
                            Selected: {dayjs(selectedDate).format("D MMMM YYYY")}
                        </Text>
                    )}

                    <TextInput
                        label="Closure Title"
                        placeholder="e.g. Annual maintenance shutdown"
                        value={title}
                        onChange={(e) => setTitle(e.currentTarget.value)}
                        size={isMobile ? "sm" : "md"}
                        required
                    />

                    <Group
                        justify="flex-end"
                        gap="xs"
                        mt="xs"
                        wrap={isMobile ? "wrap-reverse" : "nowrap"}
                    >
                        <Button
                            variant="light"
                            onClick={() => setModalOpened(false)}
                            disabled={saving}
                            fullWidth={isMobile}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleSave}
                            loading={saving}
                            fullWidth={isMobile}
                        >
                            Add Closure Day
                        </Button>
                    </Group>
                </Stack>
            </Modal>
        </Stack>
    );
}