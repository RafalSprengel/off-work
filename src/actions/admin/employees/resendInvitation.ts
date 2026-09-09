"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";
import { sendEmail } from "@/lib/sendEmail";

export async function resendInvitation(employeeId: string): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const employee = await Employee.findOne({
            _id: employeeId,
            organizationId,
        });

        if (!employee) {
            return { success: false, error: "Employee not found or access denied." };
        }

        const auth = await getAuth();

        // Pass `resend: true` so Better Auth updates the existing pending
        // invitation's expiry and re-sends the email instead of throwing
        // USER_IS_ALREADY_INVITED_TO_THIS_ORGANIZATION.
        const invitation = await auth.api.createInvitation({
            body: {
                email: employee.email,
                role: employee.role === "Manager" ? "admin" : "member",
                organizationId,
                resend: true,
            },
            headers: await headers(),
        });

        // Send the invitation email directly (reliable fallback)
        if (invitation?.id) {
            const inviteUrl = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/accept-invitation/${invitation.id}`;
            try {
                await sendEmail({
                    to: employee.email,
                    subject: `Reminder: You've been invited to join your team on Off Work`,
                    html: `
                        <!DOCTYPE html>
                        <html>
                        <head><meta charset="utf-8"></head>
                        <body style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f6f9fc; margin: 0; padding: 0;">
                            <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f6f9fc; padding: 40px 0;">
                                <tr>
                                    <td align="center">
                                        <table width="480" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                                            <tr>
                                                <td style="padding: 40px 48px 32px;">
                                                    <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px;">You're invited! 🎉</h1>
                                                    <p style="font-size: 16px; color: #64748b; line-height: 1.5; margin: 0 0 24px;">This is a reminder to accept your invitation. Click the button below to set up your account.</p>
                                                    <table cellpadding="0" cellspacing="0">
                                                        <tr>
                                                            <td align="center" style="background-color: #228be6; border-radius: 6px; padding: 12px 32px;">
                                                                <a href="${inviteUrl}" style="color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block;">Accept invitation</a>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                    <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0;">If you didn't expect this invitation, you can safely ignore this email.</p>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 24px 48px; border-top: 1px solid #e2e8f0;">
                                                    <p style="font-size: 12px; color: #94a3b8; margin: 0;">Off Work — Leave management made simple</p>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </body>
                        </html>
                    `,
                });
                console.log(`[resendInvitation] Invitation email sent directly to ${employee.email}`);
            } catch (emailError) {
                console.error(`[resendInvitation] Failed to send invitation email directly to ${employee.email}:`, emailError instanceof Error ? emailError.message : emailError);
                // Non-fatal — the invitation is already updated in Better Auth
            }
        }

        // Make sure the employee status is set to "invited"
        if (employee.status !== "invited") {
            employee.status = "invited";
            await employee.save();
        }

        revalidatePath("/team/employees");

        console.log(`[resendInvitation] Invitation re-sent to ${employee.email}`);

        return { success: true };
    } catch (error: any) {
        console.error("[resendInvitation] Error:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to resend invitation" };
    }
}