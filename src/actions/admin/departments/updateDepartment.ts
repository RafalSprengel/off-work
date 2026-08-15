"use server";

import dbConnect from "@/db/connection";
import Department from "@/db/models/Department";
import { revalidatePath } from "next/cache";
import type { IUpdateDepartmentInput } from "@/types/department";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function updateDepartment(updatedDepartment: IUpdateDepartmentInput) {
    if (!updatedDepartment.name || updatedDepartment.name.trim().length < 2) {
        return {
            success: false,
            error: "Department name must be at least 2 characters long.",
        };
    }

    try {
        await dbConnect();
        const organizationId = await getOrganizationId();
        const department = await Department.findOneAndUpdate(
            { _id: updatedDepartment._id, organization: organizationId },
            { name: updatedDepartment.name, managers: updatedDepartment.managerIds ?? [] },
            { returnDocument: "after" }
        );

        if (!department) {
            return {
                success: false,
                error: "Department not found or access denied.",
            };
        }

        revalidatePath("/departments", "page");

        return { success: true };
    } catch (error: any) {
        console.error("Error updating department:", error);

        if (error.code === 11000) {
            return {
                success: false,
                error: "A department with this name already exists.",
            };
        }

        if (error.name === "ValidationError") {
            return {
                success: false,
                error: error.message,
            };
        }

        return {
            success: false,
            error: error instanceof Error ? error.message : "An error occurred",
        };
    }
}