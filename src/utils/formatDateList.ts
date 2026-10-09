import dayjs from "dayjs";

/**
 * Zamienia liste dat (YYYY-MM-DD) na zwarty, czytelny napis.
 * Kolejne dni w tym samym miesiacu sa sklejane w zakresy,
 * np. ["2026-12-21","2026-12-22","2026-12-23","2026-12-24","2026-12-25","2026-12-28"]
 *   -> "21-25 Dec, 28 Dec".
 */
export function formatDateList(dates: string[]): string {
  const sorted = [...new Set(dates)].sort();
  if (sorted.length === 0) {
    return "";
  }

  const parts: string[] = [];
  let runStart = dayjs(sorted[0]);
  let runEnd = runStart;

  const flush = () => {
    if (runStart.isSame(runEnd, "month")) {
      const startLabel = runStart.format("D");
      const endLabel = runEnd.format("D");
      const month = runStart.format("MMM");
      parts.push(
        startLabel === endLabel
          ? `${startLabel} ${month}`
          : `${startLabel}-${endLabel} ${month}`,
      );
      return;
    }

    parts.push(
      runStart.isSame(runEnd, "day")
        ? runStart.format("D MMM")
        : `${runStart.format("D MMM")}-${runEnd.format("D MMM")}`,
    );
  };

  for (let i = 1; i < sorted.length; i++) {
    const current = dayjs(sorted[i]);

    if (current.diff(runEnd, "day") === 1) {
      runEnd = current;
    } else {
      flush();
      runStart = current;
      runEnd = current;
    }
  }

  flush();

  return parts.join(", ");
}
