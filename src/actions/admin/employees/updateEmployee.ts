"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import mongoose from "mongoose";
import type { IEmployee, IUpdateEmployeeInput } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";

export async function updateEmployee(data: IUpdateEmployeeInput): Promise<{ success: boolean; data?: IEmployee; error?: string; errorCode?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const employee = await Employee.findOneAndUpdate(
            { _id: data._id, organizationId },
            {
                firstName: data.firstName,
                lastName: data.lastName,
                email: data.email,
                role: data.role as "Manager" | "Employee",
                department: new mongoose.Types.ObjectId(data.department),
                holidayAllowance: data.holidayAllowance,
                employmentDate: new Date(data.employmentDate),
                managerId: data.managerId ? new mongoose.Types.ObjectId(data.managerId) : null,
            },
            { returnDocument: "after" }
        );

        if (!employee) {
            return { success: false, error: "Employee not found or access denied." };
        }

        revalidatePath("/employees", "page");

        return { success: true };
    } catch (error: any) {
        console.error("Error updating employee:", error);

        if (error?.code === 11000) {
            return { success: false, error: "An employee with this email already exists.", errorCode: "DUPLICATE_EMAIL" };
        }

        return { success: false, error: error instanceof Error ? error.message : "Failed to update employee" };
    }
}