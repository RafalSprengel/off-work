"use server";

import dbConnect from "@/db/connection";
import Absence from "@/db/models/Absence";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function deleteAbsence(
    id: string
): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const result = await Absence.deleteOne({
            _id: new mongoose.Types.ObjectId(id),
            organizationId,
        });

        if (result.deletedCount === 0) {
            return { success: false, error: "Absence not found or already deleted" };
        }

        revalidatePath("/team/absences");
        return { success: true };
    } catch (error) {
        console.error("Error deleting absence:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete absence",
        };
    }
}
