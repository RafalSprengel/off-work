"use server";

import dbConnect from "@/db/connection";
import { getAuth } from "@/lib/auth";
import mongoose from "mongoose";

export async function getInvitationData(invitationId: string): Promise<{
    success: boolean;
    data?: {
        email: string;
        firstName: string;
        lastName: string;
        organizationId: string;
        organizationName: string;
    };
    error?: string;
}> {
    try {
        await dbConnect();

        const auth = await getAuth();
        const ctx = await auth.$context;

        // Look up the invitation directly from the Better Auth database adapter.
        // We need the email and organizationId so we can find the matching Employee record.
        const invitation = (await ctx.adapter.findOne({
            model: "invitation",
            where: [
                { field: "id", value: invitationId },
            ],
        })) as {
            status: string;
            expiresAt: string | Date;
            email: string;
            organizationId: string;
        } | null;

        if (!invitation) {
            return { success: false, error: "Invitation not found or has expired." };
        }

        if (invitation.status !== "pending" || new Date(invitation.expiresAt) < new Date()) {
            return { success: false, error: "This invitation is no longer valid. It may have expired or already been used." };
        }

        const email = invitation.email;
        const organizationId = invitation.organizationId;

        // Look up the organization name from Better Auth
        const organization = (await ctx.adapter.findOne({
            model: "organization",
            where: [{ field: "id", value: organizationId }],
        })) as { name?: string } | null;
        const organizationName = organization?.name || "Off-Work";

        // Find the Employee record in our MongoDB by email and organizationId
        const Employee = (await import("@/db/models/Employee")).default;
        const employee = await Employee.findOne({
            email: email.toLowerCase(),
            organizationId,
        });

        return {
            success: true,
            data: {
                email,
                firstName: employee?.firstName || "",
                lastName: employee?.lastName || "",
                organizationId,
                organizationName,
            },
        };
    } catch (error: any) {
        console.error("[getInvitationData] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to load invitation data" };
    }
}