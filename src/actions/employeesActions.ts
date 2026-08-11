"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import mongoose from "mongoose";
import type { IEmployee } from "@/types/employees";
import type { ICreateEmployeeInput } from "@/types/employees";
import type { IManager } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";


export async function getEmployees(): Promise<{ success: boolean; data: IEmployee[]; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();
        const rawEmployees = await Employee.find({ organizationId }).select({}).populate("department", "name manager").lean();
        const employees: IEmployee[] = JSON.parse(JSON.stringify(rawEmployees));

        // const employees: IEmployee[] = rawEmployees.map((emp) => ({
        //     _id: emp._id.toString(),
        //     firstName: emp.firstName,
        //     lastName: emp.lastName,
        //     email: emp.email,
        //     role: emp.role,
        //     department: emp.department ? {
        //         name: emp.department.name
        //     } : undefined,
        //     proposedAnnualLeave: emp.proposedAnnualLeave,
        //     employmentDate: emp.employmentDate instanceof Date
        //         ? emp.employmentDate.toISOString()
        //         : String(emp.employmentDate),
        //     managerId: emp.managerId?.toString(),
        //     organizationId: emp.organizationId?.toString(),
        //     status: emp.status as "active" | "inactive" | "invited",
        // }));

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

        const emp = employee.toObject();

        return {
            success: true,
            data: {
                _id: emp._id.toString(),
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                role: emp.role,
                department: emp.department.toString(),
                proposedAnnualLeave: emp.proposedAnnualLeave,
                employmentDate: emp.employmentDate instanceof Date
                    ? emp.employmentDate.toISOString()
                    : String(emp.employmentDate),
                organizationId: emp.organizationId?.toString(),
                status: emp.status as "active" | "inactive" | "invited",
            },
        };
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