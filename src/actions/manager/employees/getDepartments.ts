"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/connection";
import Department from "@/db/models/Department";
import Employee from "@/db/models/Employee";
import type { IDepartment } from "@/types/department";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function getDepartments(): Promise<{ success: boolean, data: IDepartment[], error: string | null }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const rawDepartments = await Department.aggregate([
            { $match: { organization: organizationId } },
            {
                $lookup: {
                    from: "employees",
                    localField: "managers",
                    foreignField: "_id",
                    pipeline: [
                        { $project: { firstName: 1, lastName: 1, _id: 1 } },
                    ],
                    as: "managers",
                },
            },
            { $project: { _id: 1, name: 1, managers: 1, organization: 1 } },
        ]);

        const departments: IDepartment[] = JSON.parse(JSON.stringify(rawDepartments));

        const departmentObjectIds = departments.map((d) => new mongoose.Types.ObjectId(d._id));

        const employeeCounts = await Employee.aggregate([
            {
                $match: {
                    department: { $in: departmentObjectIds },
                    status: { $ne: "inactive" }
                }
            },
            { $group: { _id: "$department", count: { $sum: 1 } } },
        ]);

        const countMap = new Map(
            employeeCounts.map((item) => [String(item._id), item.count])
        );

        for (const dept of departments) {
            dept.employeeCount = countMap.get(String(dept._id)) ?? 0;
        }

        return {
            success: true,
            data: departments,
            error: null,
        };
    } catch (error: any) {
        console.error("Error fetching departments:", error);

        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : "An error occurred",
        };
    }
}