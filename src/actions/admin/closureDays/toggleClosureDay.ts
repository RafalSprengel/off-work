"use server";

import dbConnect from "@/db/connection";
import ClosureDay from "@/db/models/ClosureDay";
import { revalidatePath } from "next/cache";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function toggleClosureDay(id: string, enabled: boolean) {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const result = await ClosureDay.findOneAndUpdate(
            { _id: id, organizationId },
            { enabled },
            { new: true },
        );

        if (!result) {
            return {
                success: false,
                error: "Closure day not found or access denied.",
            };
        }

        revalidatePath("/team/settings/holidays");

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error toggling closure day:", error);

        return {
            success: false,
            error: error instanceof Error ? error.message : "An error occurred",
        };
    }
}