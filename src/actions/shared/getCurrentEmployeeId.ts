"use server";

import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";

export async function getCurrentEmployeeId(): Promise<string> {
    const auth = await getAuth();

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    if (!session?.user) {
        throw new Error("Unauthorized: No active session");
    }

    await dbConnect();

    const employee = await Employee.findOne({ userId: session.user.id }).lean();

    if (!employee) {
        throw new Error("No Employee profile linked to this account");
    }

    return String(employee._id);
}