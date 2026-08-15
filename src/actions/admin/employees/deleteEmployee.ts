"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";

export async function deleteEmployee(_id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();
        const result = await Employee.findOneAndDelete({ _id, organizationId });

        if (!result) {
            return { success: false, error: "Employee not found or access denied." };
        }

        revalidatePath("/employees", "page");

        return { success: true };
    } catch (error) {
        console.error("Error deleting employee:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete employee" };
    }
}