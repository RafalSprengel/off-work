"use client";

import { Text, UnstyledButton } from "@mantine/core";
import {
    IconArrowDown,
    IconArrowUp,
    IconArrowsSort,
} from "@tabler/icons-react";
import type { SortDirection } from "@/utils/sort";

/**
 * Clickable column header that toggles the sort direction of its column.
 * Shows an up arrow when sorted ascending, a down arrow when sorted
 * descending and a neutral sort icon when the column is not active.
 */
export default function SortableHeader({
    label,
    active,
    direction,
    onSort,
    align = "left",
    fullWidth = true,
}: {
    label: string;
    active: boolean;
    direction: SortDirection;
    onSort: () => void;
    align?: "left" | "right" | "center";
    fullWidth?: boolean;
}) {
    return (
        <UnstyledButton
            onClick={onSort}
            style={{
                display: "flex",
                alignItems: "center",
                gap: 4,
                cursor: "pointer",
                width: fullWidth ? "100%" : undefined,
                justifyContent:
                    align === "right"
                        ? "flex-end"
                        : align === "center"
                            ? "center"
                            : "flex-start",
            }}
        >
            <Text size="sm" fw={600}>
                {label}
            </Text>
            {active ? (
                direction === "asc" ? (
                    <IconArrowUp size={14} />
                ) : (
                    <IconArrowDown size={14} />
                )
            ) : (
                <IconArrowsSort size={14} style={{ opacity: 0.4 }} />
            )}
        </UnstyledButton>
    );
}