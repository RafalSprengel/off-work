"use server";

import dbConnect from "@/db/connection";
import Department from "@/db/models/Department";
import { revalidatePath } from "next/cache";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function deleteDepartment(_id: string) {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();
        const result = await Department.findOneAndDelete({ _id, organization: organizationId });

        if (!result) {
            return {
                success: false,
                error: "Department not found or access denied.",
            };
        }

        revalidatePath("/departments", "page");

        return {
            success: true,
            error: null,
        };
    } catch (error: any) {
        console.error("Error deleting department:", error);

        return {
            success: false,
            error: error instanceof Error ? error.message : "An error occurred",
        };
    }
}