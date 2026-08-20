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

    await resend.emails.send({
        from: process.env.EMAIL_FROM ?? "Off Work <onboarding@resend.dev>",
        to,
        subject,
        html,
    });
}