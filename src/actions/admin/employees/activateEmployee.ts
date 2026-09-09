"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { sendEmail } from "@/lib/sendEmail";
import { revalidatePath } from "next/cache";

const BASE_URL = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";

export async function activateEmployee(_id: string): Promise<{ success: boolean; error?: string }> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const employee = await Employee.findOne({ _id, organizationId });

        if (!employee) {
            return { success: false, error: "Employee not found or access denied." };
        }

        if (employee.status !== "inactive") {
            return { success: false, error: "Only deactivated employees can be activated." };
        }

        // 1. Restore status in MongoDB — same _id, all historical records stay linked
        await Employee.updateOne({ _id, organizationId }, { $set: { status: "active" } });

        // 2. Send a transactional email (not a Better Auth invitation)
        try {
            await sendEmail({
                to: employee.email,
                subject: `Your account has been reactivated — Off Work`,
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
                                                <h1 style="font-size: 24px; font-weight: 700; color: #1a1a2e; margin: 0 0 8px;">Welcome back! 🎉</h1>
                                                <p style="font-size: 16px; color: #64748b; line-height: 1.5; margin: 0 0 24px;">Your account has been reactivated. You can now log in and access all your data.</p>
                                                <table cellpadding="0" cellspacing="0">
                                                    <tr>
                                                        <td align="center" style="background-color: #228be6; border-radius: 6px; padding: 12px 32px;">
                                                            <a href="${BASE_URL}/sign-in" style="color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; display: inline-block;">Log in to your account</a>
                                                        </td>
                                                    </tr>
                                                </table>
                                                <p style="font-size: 14px; color: #94a3b8; line-height: 1.5; margin: 24px 0 0;">
                                                    If you've forgotten your password, you can
                                                    <a href="${BASE_URL}/forgot-password" style="color: #228be6; text-decoration: underline;">reset it here</a>.
                                                </p>
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
            console.log(`[activateEmployee] Reactivation email sent to ${employee.email}`);
        } catch (emailError) {
            console.error("[activateEmployee] Failed to send reactivation email:", emailError instanceof Error ? emailError.message : emailError);
            // Non-fatal — the record is already active
        }

        revalidatePath("/team/employees");
        revalidatePath("/employees");

        return { success: true };
    } catch (error) {
        console.error("Error activating employee:", error);
        return { success: false, error: error instanceof Error ? error.message : "Failed to activate employee" };
    }
}