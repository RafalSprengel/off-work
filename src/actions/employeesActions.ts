"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import mongoose from "mongoose";
import type { IEmployee } from "@/types/employees";
import type { ICreateEmployeeInput } from "@/types/employees";
import type { IManager } from "@/types/employees";
import type { IUpdateEmployeeInput } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";


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
            proposedAnnualLeave: data.proposedAnnualLeave,
            employmentDate: new Date(data.employmentDate),
            ...(data.managerId ? { managerId: new mongoose.Types.ObjectId(data.managerId) } : {}),
            organizationId: new mongoose.Types.ObjectId(organizationId),
            status: "invited" as const,
        });

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
                proposedAnnualLeave: data.proposedAnnualLeave,
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