import type { IManager } from "@/types/employees";

/**
 * Builds the display label for a manager option. When the person manages one or
 * more departments, their names are appended in parentheses, e.g.
 * "George Williams (Sales)" or "George Williams (Sales, Support)".
 */
export function formatManagerLabel(manager: IManager): string {
  const fullName = `${manager.firstName} ${manager.lastName}`;
  const departments = manager.departments ?? [];

  return departments.length > 0
    ? `${fullName} (${departments.join(", ")})`
    : fullName;
}
