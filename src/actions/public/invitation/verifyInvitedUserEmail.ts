"use server";

import { getAuth } from "@/lib/auth";

/**
 * Marks the invited user's email as verified.
 *
 * When a user registers via an invitation link, they have already proven
 * ownership of the email address by clicking the link that was sent to it.
 * There is therefore no need to go through a separate email-verification step.
 *
 * This action validates that the invitationId is a real, pending invitation
 * for the given email before setting emailVerified = true, so it cannot be
 * abused to skip verification for arbitrary accounts.
 */
export async function verifyInvitedUserEmail(params: {
    email: string;
    invitationId: string;
}): Promise<{ success: boolean; error?: string }> {
    try {
        const auth = await getAuth();
        const ctx = await auth.$context;

        // 1. Confirm the invitation is real, pending, and belongs to this email
        const invitation = await ctx.adapter.findOne({
            model: "invitation",
            where: [{ field: "id", value: params.invitationId }],
        });

        if (!invitation) {
            return { success: false, error: "Invitation not found." };
        }

        const invitationEmail = (invitation.email as string) ?? "";
        if (invitationEmail.toLowerCase() !== params.email.toLowerCase()) {
            return { success: false, error: "Email does not match invitation." };
        }

        if (
            invitation.status !== "pending" ||
            new Date(invitation.expiresAt as string) < new Date()
        ) {
            return { success: false, error: "Invitation is no longer valid." };
        }

        // 2. Find the newly created user
        const user = await ctx.adapter.findOne({
            model: "user",
            where: [{ field: "email", value: params.email.toLowerCase() }],
        });

        if (!user) {
            return { success: false, error: "User not found." };
        }

        if (user.emailVerified) {
            // Already verified — nothing to do
            return { success: true };
        }

        // 3. Mark email as verified
        await ctx.adapter.update({
            model: "user",
            where: [{ field: "id", value: user.id as string }],
            update: { emailVerified: true },
        });

        console.log(
            `[verifyInvitedUserEmail] Email verified for invited user ${params.email} via invitation ${params.invitationId}`
        );

        return { success: true };
    } catch (error: any) {
        console.error("[verifyInvitedUserEmail] Error:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to verify email",
        };
    }
}
