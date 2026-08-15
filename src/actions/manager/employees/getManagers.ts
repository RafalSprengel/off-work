"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import type { IManager } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function getManagers(): Promise<{ success: boolean; data?: IManager[]; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();
        const managers = await Employee.find({ role: "Manager", status: { $in: ["active", "invited"] }, organizationId }).select("_id firstName lastName").lean()
        const formattedManagers: IManager[] = managers.map((manager) => ({
            _id: manager._id.toString(),
            firstName: manager.firstName,
            lastName: manager.lastName,
        }))

        return { success: true, data: formattedManagers }
    }
    catch (e: any) {
        console.error("Error fetching managers:", e);
        return { success: false, data: [], error: e.message }
    }
}