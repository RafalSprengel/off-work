export type SortDirection = "asc" | "desc";

/**
 * Compares two values in a type-aware way so columns holding strings, numbers
 * or dates can all be sorted with the same helper.
 */
export function compareValues(a: unknown, b: unknown): number {
    if (a == null && b == null) return 0;
    if (a == null) return -1;
    if (b == null) return 1;

    if (typeof a === "number" && typeof b === "number") {
        return a - b;
    }

    if (a instanceof Date && b instanceof Date) {
        return a.getTime() - b.getTime();
    }

    return String(a).localeCompare(String(b), undefined, { sensitivity: "base" });
}

/**
 * Returns a sorted copy of `items` using `getValue` to extract the value of the
 * column being sorted. When `direction` is "desc" the ascending order is
 * reversed.
 */
export function sortItems<T>(
    items: T[],
    getValue: (item: T) => unknown,
    direction: SortDirection,
): T[] {
    const sorted = [...items].sort((a, b) =>
        compareValues(getValue(a), getValue(b)),
    );

    return direction === "asc" ? sorted : sorted.reverse();
}