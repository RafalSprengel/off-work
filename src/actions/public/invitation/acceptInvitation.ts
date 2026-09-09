"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

/**
 * Called AFTER the user has signed up and accepted the invitation on the client.
 * Finds the Employee record that was pre-created by the admin (with status "invited"
 * and userId: null) and sets it to "active" with the new user's Better Auth userId.
 *
 * This is a safety net on top of the afterAddMember hook in auth.ts — the hook
 * should handle this automatically, but in case it fails (e.g. timing, edge case),
 * this action guarantees the Employee record is activated.
 */
export async function activateEmployeeAfterInvite(params: {
    email: string;
    organizationId: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();

        // Get the currently authenticated user ID from the session
        const auth = await getAuth();
        const session = await auth.api.getSession({
            headers: await headers(),
        });

        if (!session?.user?.id) {
            return { success: false, error: "No authenticated user found" };
        }

        // Find the invited Employee record and activate it
        const result = await Employee.findOneAndUpdate(
            {
                email: params.email.toLowerCase(),
                organizationId: params.organizationId,
                userId: null,
                status: "invited",
            },
            {
                $set: {
                    userId: session.user.id,
                    status: "active",
                },
            },
            { new: true }
        );

        if (!result) {
            // Could already be active from the hook — that's fine
            console.log(
                "[activateEmployeeAfterInvite] No pending invited record found for",
                params.email,
                "- may already be activated"
            );
            return { success: true };
        }

        console.log(
            `[activateEmployeeAfterInvite] Activated employee ${result.email} (userId=${session.user.id})`
        );
        return { success: true };
    } catch (error: any) {
        console.error("[activateEmployeeAfterInvite] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to activate employee",
        };
    }
}