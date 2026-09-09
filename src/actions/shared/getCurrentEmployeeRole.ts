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

        // Block deactivated employees from accessing the app
        if (employee.status === "inactive") {
            return { success: false, role: null, error: "Account is deactivated" };
        }

        // Owners and Managers get manager-level access routing.
        // Check both the Employee's isOwner flag (faster) and Better Auth's
        // member collection (source of truth) as a fallback, so even if the
        // afterAddMember hook didn't set isOwner, the system still works.
        if (employee.isOwner) {
            return { success: true, role: "Manager", error: null };
        }

        // Fallback: query Better Auth member collection directly.
        // The member collection is the source of truth for org-level roles.
        const activeOrgId = session.session?.activeOrganizationId;
        if (activeOrgId) {
            try {
                const ctx = await auth.$context;
                const member = await ctx.adapter.findOne({
                    model: "member",
                    where: [
                        { field: "userId", value: resolvedUserId },
                        { field: "organizationId", value: activeOrgId },
                    ],
                });
                if (member && (member as any).role === "owner") {
                    return { success: true, role: "Manager", error: null };
                }
            } catch (adapterError) {
                console.warn("[getCurrentEmployeeRole] Failed to query Better Auth member:", adapterError);
                // Fall through to regular role check
            }
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