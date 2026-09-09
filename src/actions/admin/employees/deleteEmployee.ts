"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { revalidatePath } from "next/cache";

export async function deleteEmployee(_id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        // Fetch the employee first so we know the email and userId for cleanup
        const employee = await Employee.findOne({ _id, organizationId });

        if (!employee) {
            return { success: false, error: "Employee not found or access denied." };
        }

        // Prevent deletion of the organization owner
        if (employee.isOwner) {
            return { success: false, error: "The organization owner cannot be deleted." };
        }

        const auth = await getAuth();

        // 1. Remove the member from the organization in Better Auth
        if (employee.userId) {
            try {
                await auth.api.removeMember({
                    body: {
                        memberIdOrEmail: employee.userId,
                        organizationId,
                    },
                    headers: await headers(),
                });
                console.log(`[deleteEmployee] Removed member userId=${employee.userId} from organization`);
            } catch (memberError) {
                // Could already be removed or never added — log and continue
                console.warn("[deleteEmployee] removeMember call:", memberError instanceof Error ? memberError.message : memberError);
            }
        }

        // 2. Cancel any pending invitation for this email in this organization
        const ctx = await auth.$context;
        try {
            const invitation = await ctx.adapter.findOne({
                model: "invitation",
                where: [
                    { field: "organizationId", value: organizationId },
                    { field: "email", value: employee.email },
                    { field: "status", value: "pending" },
                ],
            });

            if (invitation) {
                await auth.api.cancelInvitation({
                    body: {
                        invitationId: invitation.id as string,
                    },
                    headers: await headers(),
                });
                console.log(`[deleteEmployee] Canceled invitation for ${employee.email}`);
            }
        } catch (invitationError) {
            console.warn("[deleteEmployee] Failed to cancel invitation:", invitationError instanceof Error ? invitationError.message : invitationError);
        }

        // 3. Delete the Employee document from MongoDB
        await Employee.deleteOne({ _id, organizationId });

        revalidatePath("/team/employees");
        revalidatePath("/employees");

        return { success: true };
    } catch (error) {
        console.error("Error deleting employee:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to delete employee" };
    }
}