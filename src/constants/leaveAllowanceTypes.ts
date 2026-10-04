/**
 * Single source of truth for leave allowance types (per-type day limits).
 * To add/remove an allowance type in the future, edit this file only.
 */

export const LEAVE_ALLOWANCE_TYPES = [
    "annual",
    "unpaid",
    "sick",
    "maternity",
    "paternity",
    "bereavement",
] as const;

export type LeaveAllowanceType = (typeof LEAVE_ALLOWANCE_TYPES)[number];

export const LEAVE_ALLOWANCE_LABELS: Record<LeaveAllowanceType, string> = {
    annual: "Annual allowance",
    unpaid: "Unpaid leave",
    sick: "Sick",
    maternity: "Maternity",
    paternity: "Paternity",
    bereavement: "Bereavement",
};

export function getLeaveAllowanceLabel(type: string): string {
    return LEAVE_ALLOWANCE_LABELS[type as LeaveAllowanceType] ?? type;
}
