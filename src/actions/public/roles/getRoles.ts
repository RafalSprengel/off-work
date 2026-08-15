"use server";

import Employee from "@/db/models/Employee";
import dbConnect from "@/db/connection";

export async function getRoles(): Promise<{ success: boolean; data: string[]; error: string | null }> {
    try {
        await dbConnect();
        const rolePath = Employee.schema.path("role") as any;
        const roles: string[] = rolePath?.enumValues ?? [];

        return {
            success: true,
            data: roles,
            error: null,
        };
    } catch (error: any) {
        console.error("Error fetching roles:", error);

        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : "An error occurred",
        };
    }
}