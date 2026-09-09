"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";

export async function deactivateEmployee(_id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const employee = await Employee.findOne({ _id, organizationId });

        if (!employee) {
            return { success: false, error: "Employee not found or access denied." };
        }

        // Prevent deactivation of the organization owner
        if (employee.isOwner) {
            return { success: false, error: "The organization owner cannot be deactivated." };
        }

        // Update status in MongoDB — the app blocks access via getCurrentEmployeeRole
        await Employee.updateOne({ _id, organizationId }, { $set: { status: "inactive" } });

        revalidatePath("/team/employees");
        revalidatePath("/employees");

        return { success: true };
    } catch (error) {
        console.error("Error deactivating employee:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to deactivate employee" };
    }
}