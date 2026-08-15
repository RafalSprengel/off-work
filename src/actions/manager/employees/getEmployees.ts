"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import type { IEmployee } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function getEmployees(): Promise<{ success: boolean; data: IEmployee[]; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();
        const rawEmployees = await Employee.find({ organizationId }).select({}).populate("department", "name manager").lean();
        const employees: IEmployee[] = JSON.parse(JSON.stringify(rawEmployees));

        return { success: true, data: employees };

    } catch (error) {
        console.error("Error fetching employees:", error);
        return { success: false, data: [], error: error instanceof Error ? error.message : "Failed to fetch employees" };
    }
}