"use server";

import dbConnect from "@/db/connection";
import ClosureDay from "@/db/models/ClosureDay";
import { revalidatePath } from "next/cache";
import { getOrganizationId } from "@/utils/getOrganizationId";
import type { UpdateClosureDayResult } from "@/types/closureDay";

export async function updateClosureDay(
    id: string,
    title: string
): Promise<UpdateClosureDayResult> {
    try {
        const trimmedTitle = title?.trim();

        if (!id) {
            return { success: false, error: "Closure day id is required." };
        }

        if (!trimmedTitle || trimmedTitle.length === 0) {
            return { success: false, error: "Title is required." };
        }

        await dbConnect();
        const organizationId = await getOrganizationId();

        const result = await ClosureDay.findOneAndUpdate(
            { _id: id, organizationId },
            { title: trimmedTitle },
            { new: true },
        );

        if (!result) {
            return {
                success: false,
                error: "Closure day not found or access denied.",
            };
        }

        revalidatePath("/team/settings/closures");

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error updating closure day:", error);

        return {
            success: false,
            error: error instanceof Error ? error.message : "An error occurred",
        };
    }
}
