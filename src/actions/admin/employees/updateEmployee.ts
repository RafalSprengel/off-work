"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import mongoose from "mongoose";
import type { IEmployee, IUpdateEmployeeInput } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function updateEmployee(data: IUpdateEmployeeInput): Promise<{ success: boolean; data?: IEmployee; error?: string; errorCode?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        // Fetch the existing employee BEFORE updating to check if the email changed
        const existingEmployee = await Employee.findOne({ _id: data._id, organizationId });

        if (!existingEmployee) {
            return { success: false, error: "Employee not found or access denied." };
        }

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

        // If the email changed and the employee has a linked Better Auth user,
        // update the Better Auth user's email as well to keep them in sync.
        const emailChanged = existingEmployee.email !== data.email;
        if (emailChanged && existingEmployee.userId) {
            try {
                const auth = await getAuth();
                // Access the internal adapter via auth.$context to update the user email
                const ctx = await auth.$context;
                await ctx.internalAdapter.updateUser(existingEmployee.userId, {
                    email: data.email,
                });
                console.log(`[updateEmployee] Better Auth user email updated from ${existingEmployee.email} to ${data.email}`);
            } catch (authError) {
                console.error("[updateEmployee] Failed to update Better Auth user email:", authError);
                // Don't block the employee update - log and continue
            }
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