import type { ClosureDayType } from "@/db/models/ClosureDay";

export interface ClosureDayItem {
    id: string;
    date: string; // "YYYY-MM-DD"
    title: string;
    type: ClosureDayType;
    region: string | null;
    batchLabel: string | null;
    enabled: boolean;
    isCustom: boolean;
}

export interface GetClosureDaysResult {
    success: boolean;
    data: ClosureDayItem[];
    error: string | null;
}

export interface CreateClosureDayInput {
    date: string; // YYYY-MM-DD
    title: string;
}

export interface CreateClosureDayResult {
    success: boolean;
    error: string | null;
}

export interface ClearBankHolidaysResult {
    success: boolean;
    deletedCount: number;
    error: string | null;
}