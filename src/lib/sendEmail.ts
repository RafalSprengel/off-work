import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

type SendEmailArgs = {
    to: string;
    subject: string;
    html: string;
};

export async function sendEmail({ to, subject, html }: SendEmailArgs) {
    if (!process.env.RESEND_API_KEY) {
        // Dev fallback so auth flows are testable before Resend is wired up.
        console.log(`[sendEmail] (no RESEND_API_KEY set) to=${to} subject="${subject}"\n${html}`);
        return;
    }

    try {
        const { data, error } = await resend.emails.send({
            from: process.env.EMAIL_FROM ?? "Off Work <onboarding@resend.dev>",
            to,
            subject,
            html,
        });

        if (error) {
            console.error("[sendEmail] Resend API returned an error:", JSON.stringify(error));
            throw new Error(typeof error === "string" ? error : error.message || "Resend email send failed");
        }

        console.log(`[sendEmail] Successfully sent email to=${to} subject="${subject}" resendId=${data?.id}`);
    } catch (err) {
        console.error("[sendEmail] Failed to send email:", err instanceof Error ? err.message : err);
        throw err; // Re-throw so Better Auth's sendInvitationEmail can log it
    }
}