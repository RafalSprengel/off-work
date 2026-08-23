"use server";

import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";

export async function getCurrentEmployeeRole(options?: {
    freshSession?: boolean;
}): Promise<{
    success: boolean;
    role: "Manager" | "Employee" | null;
    error: string | null;
}> {
    try {
        const auth = await getAuth();
        const reqHeaders = await headers();

        const session = await auth.api.getSession({
            headers: reqHeaders,
            ...(options?.freshSession ? { query: { disableCookieCache: true } } : {}),
        });

        if (!session?.user) {
            return { success: false, role: null, error: "Unauthorized: No active session" };
        }

        const resolvedUserId = session.user.id;

        await dbConnect();

        const employee = await Employee.findOne({ userId: resolvedUserId }).lean();

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