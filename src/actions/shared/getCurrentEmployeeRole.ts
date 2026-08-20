"use server";

import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";

export async function getCurrentEmployeeRole(): Promise<{
    success: boolean;
    role: "Manager" | "Employee" | null;
    error: string | null;
}> {
    try {
        const auth = await getAuth();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, role: null, error: "Unauthorized: No active session" };
        }

        await dbConnect();

        const employee = await Employee.findOne({ userId: session.user.id }).lean();

        if (!employee) {
            return { success: false, role: null, error: "No Employee profile linked to this account" };
        }

        return { success: true, role: employee.role, error: null };
    } catch (error) {
        console.error("Error fetching current employee role:", error);

        return {
            success: false,
            role: null,
            error: error instanceof Error ? error.message : "An error occurred",
        };
    }
}