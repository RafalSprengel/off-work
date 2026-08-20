"use server";

import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import type { IEmployee } from "@/types/employees";

export async function getCurrentEmployee(): Promise<{
    success: boolean;
    data: IEmployee | null;
    error: string | null;
}> {
    try {
        const auth = await getAuth();

        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user) {
            return { success: false, data: null, error: "Unauthorized: No active session" };
        }

        await dbConnect();

        const employee = await Employee.findOne({ userId: session.user.id })
            .populate("department")
            .lean();

        if (!employee) {
            return {
                success: false,
                data: null,
                error: "No Employee profile linked to this account",
            };
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(employee)),
            error: null,
        };
    } catch (error) {
        console.error("Error fetching current employee:", error);

        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : "An error occurred",
        };
    }
}