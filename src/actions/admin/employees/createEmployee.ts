"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import mongoose from "mongoose";
import type { ICreateEmployeeInput, IEmployee } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function createEmployee(data: ICreateEmployeeInput): Promise<{ success: boolean; data?: IEmployee; error?: string; errorCode?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const employee = await Employee.create({
            firstName: data.firstName,
            lastName: data.lastName,
            email: data.email,
            role: data.role as "Manager" | "Employee",
            department: new mongoose.Types.ObjectId(data.department),
            holidayAllowance: data.holidayAllowance,
            employmentDate: new Date(data.employmentDate),
            ...(data.managerId ? { managerId: new mongoose.Types.ObjectId(data.managerId) } : {}),
            organizationId,
            status: "invited" as const,
        });

        // Send the actual Better Auth organization invitation so the new
        // hire gets an email and can create their account via
        // /accept-invitation/[id]. Without this, the Employee row above is
        // just a placeholder nobody can ever activate.
        try {
            const auth = await getAuth();
            await auth.api.createInvitation({
                body: {
                    email: data.email,
                    role: data.role === "Manager" ? "admin" : "member",
                    organizationId,
                },
                headers: await headers(),
            });
        } catch (invitationError) {
            // Roll back the Employee row so we don't leave behind an
            // "invited" placeholder that can never actually be invited.
            await employee.deleteOne();
            throw invitationError;
        }

        revalidatePath("/employees");
        return { success: true };
    } catch (error: any) {
        console.error("Error creating employee:", error);

        if (error?.code === 11000) {
            return { success: false, error: "An employee with this email already exists.", errorCode: "DUPLICATE_EMAIL" };
        }

        return { success: false, error: error instanceof Error ? error.message : "Failed to create employee" };
    }
}