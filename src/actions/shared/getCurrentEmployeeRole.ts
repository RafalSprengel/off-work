"use server";

import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";

/**
 * Resolve the current user's role.
 *
 * When called from the sign-in flow **right after setActive()** the server-side
 * session cookie may still be cached (cookieCache maxAge = 5 min).  Pass the
 * `userId` obtained from the *client-side* `authClient.getSession()` (which is
 * always fresh) to bypass the cache and read the Employee record directly.
 */
export async function getCurrentEmployeeRole(
    userId?: string | null,
): Promise<{
    success: boolean;
    role: "Manager" | "Employee" | null;
    error: string | null;
}> {
    try {
        let resolvedUserId = userId;

        if (!resolvedUserId) {
            const auth = await getAuth();
            const session = await auth.api.getSession({
                headers: await headers(),
            });
            if (!session?.user) {
                return { success: false, role: null, error: "Unauthorized: No active session" };
            }
            resolvedUserId = session.user.id;
        }

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