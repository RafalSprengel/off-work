"use server";

import dbConnect from "@/db/connection";
import ClosureDay from "@/db/models/ClosureDay";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function getUkBankHolidays(): Promise<{
    success: boolean;
    data: string[];
    error: string | null;
}> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const closureDays = await ClosureDay.find({
            organizationId,
            type: "bank_holiday",
            enabled: true,
        })
            .select("date")
            .sort({ date: 1 })
            .lean();

        const holidayDates = closureDays.map((day) => day.date);

        return {
            success: true,
            data: holidayDates,
            error: null,
        };
    } catch (error: unknown) {
        console.error("Error fetching UK bank holidays:", error);
        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : "Failed to load bank holidays",
        };
    }
}