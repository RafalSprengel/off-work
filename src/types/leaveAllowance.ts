import type { LeaveAllowanceType } from "@/constants/leaveAllowanceTypes";

export interface ILeaveAllowanceItem {
    id: string;
    employee: string;
    type: LeaveAllowanceType;
    days: number;
}

export interface SetLeaveAllowanceInput {
    employeeId: string;
    type: LeaveAllowanceType;
    days: number;
}

export type GetLeaveAllowancesResult =
    | { success: true; data: ILeaveAllowanceItem[]; error: null }
    | { success: false; data: []; error: string };

export type SetLeaveAllowanceResult =
    | { success: true; data: ILeaveAllowanceItem; error: null }
    | { success: false; data: null; error: string };
