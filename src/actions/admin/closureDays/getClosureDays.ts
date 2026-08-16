"use server";

import dbConnect from "@/db/connection";
import ClosureDay, { type ClosureDayType } from "@/db/models/ClosureDay";
import { getOrganizationId } from "@/utils/getOrganizationId";

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

export async function getClosureDays(
    type?: ClosureDayType,
    fromDate?: string
): Promise<GetClosureDaysResult> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const filter: Record<string, unknown> = { organizationId };

        if (type) {
            filter.type = type;
        }

        if (fromDate) {
            filter.date = { $gte: fromDate };
        }

        const closureDays = await ClosureDay.find(filter).sort({ date: 1 }).lean();

        const data: ClosureDayItem[] = closureDays.map((day) => ({
            id: day._id.toString(),
            date: day.date, // jest string "YYYY-MM-DD"
            title: day.title,
            type: day.type,
            region: day.region,
            batchLabel: day.batchLabel,
            enabled: day.enabled,
            isCustom: day.isCustom,
        }));

        return { success: true, data, error: null };
    } catch (error: unknown) {
        console.error("Error fetching closure days:", error);
        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : "Failed to load closure days",
        };
    }
}