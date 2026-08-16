"use server";

import dbConnect from "@/db/connection";
import ClosureDay from "@/db/models/ClosureDay";
import { revalidatePath } from "next/cache";
import { getOrganizationId } from "@/utils/getOrganizationId";

export interface ClearBankHolidaysResult {
    success: boolean;
    deletedCount: number;
    error: string | null;
}

export async function clearBankHolidays(): Promise<ClearBankHolidaysResult> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const result = await ClosureDay.deleteMany({
            organizationId,
            type: "bank_holiday",
        });

        revalidatePath("/team/settings/holidays");

        return {
            success: true,
            deletedCount: result.deletedCount,
            error: null,
        };
    } catch (error: unknown) {
        console.error("Error clearing bank holidays:", error);
        return {
            success: false,
            deletedCount: 0,
            error: error instanceof Error ? error.message : "Failed to clear bank holidays",
        };
    }
}