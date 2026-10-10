"use server";

import dbConnect from "@/db/connection";
import Department from "@/db/models/Department";
import Employee from "@/db/models/Employee";
import type { IManager } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function getManagers(): Promise<{ success: boolean; data?: IManager[]; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();
        const managers = await Employee.find({ role: "Manager", status: { $in: ["active", "invited"] }, organizationId })
            .select("_id firstName lastName department")
            .lean()

        // A department keeps its managers in the `managers` array, so a single query maps
        // every manager to the departments they explicitly manage. Managers that are not
        // assigned to any department that way fall back to their own `department` field.
        const departmentIds = managers
            .map((manager) => manager.department)
            .filter(Boolean)
        const departments = await Department.find({
            organization: organizationId,
            $or: [
                { managers: { $in: managers.map((manager) => manager._id) } },
                { _id: { $in: departmentIds } },
            ],
        })
            .select("name managers")
            .lean()

        const departmentNamesById = new Map<string, string>()
        const departmentsByManager = new Map<string, string[]>()
        for (const department of departments) {
            departmentNamesById.set(department._id.toString(), department.name)
            for (const managerId of department.managers ?? []) {
                const key = managerId.toString()
                const names = departmentsByManager.get(key)
                if (names) names.push(department.name)
                else departmentsByManager.set(key, [department.name])
            }
        }

        const formattedManagers: IManager[] = managers.map((manager) => {
            const managed = departmentsByManager.get(manager._id.toString()) ?? []
            const ownDepartment = manager.department
                ? departmentNamesById.get(manager.department.toString())
                : undefined
            const departmentNames = managed.length > 0 ? managed : ownDepartment ? [ownDepartment] : []

            return {
                _id: manager._id.toString(),
                firstName: manager.firstName,
                lastName: manager.lastName,
                departments: departmentNames.sort((a, b) => a.localeCompare(b)),
            }
        })

        return { success: true, data: formattedManagers }
    }
    catch (e: any) {
        console.error("Error fetching managers:", e);
        return { success: false, data: [], error: e.message }
    }
}