import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { organization, admin } from "better-auth/plugins";
import mongoose from "mongoose";
import dbConnect from "@/db/connection";
import { sendEmail } from "@/lib/sendEmail";
import { Db } from "mongodb";
import Employee from "@/db/models/Employee";

function createAuth(db: Db) {
    return betterAuth({
        database: mongodbAdapter(db),

        // Same pattern as the accommodation-booking project: don't hit the DB
        // on every protected route transition, only every 5 minutes (or when
        // the session actually changes).
        session: {
            cookieCache: {
                enabled: true,
                maxAge: 60 * 5, // 5 minutes
            },
        },

        emailAndPassword: {
            enabled: true,
            minPasswordLength: 8,
            sendResetPassword: async ({ url, user }) => {
                await sendEmail({
                    to: user.email,
                    subject: "Reset your password - Off Work",
                    html: `
                        <p>Hi,</p>
                        <p>Click the link below to reset your password:</p>
                        <p><a href="${url}">${url}</a></p>
                        <p>If you didn't request this, you can ignore this email.</p>
                    `,
                });
            },
        },

        emailVerification: {
            sendVerificationEmail: async ({ user, url }) => {
                try {
                    await sendEmail({
                        to: user.email,
                        subject: "Confirm your email - Off Work",
                        html: `
                            <p>Hi,</p>
                            <p>Please confirm your email address:</p>
                            <p><a href="${url}">${url}</a></p>
                        `,
                    });
                } catch (err) {
                    console.error("[auth] sendVerificationEmail: send error:", err);
                }
            },
        },

        user: {
            changeEmail: {
                enabled: true,
            },
        },

        plugins: [
            // --- Tenancy: source of truth for organizations/members/invitations ---
            organization({
                creatorRole: "owner",

                sendInvitationEmail: async (data) => {
                    const inviteUrl = `${process.env.BETTER_AUTH_URL ?? "http://localhost:3000"}/accept-invitation/${data.id}`;
                    await sendEmail({
                        to: data.email,
                        subject: `You've been invited to join ${data.organization.name} on Off Work`,
                        html: `
                            <p>Hi,</p>
                            <p>${data.inviter.user.name || data.inviter.user.email} invited you to join <strong>${data.organization.name}</strong> on Off Work.</p>
                            <p><a href="${inviteUrl}">Accept invitation</a></p>
                        `,
                    });
                },

                // Automatically create the matching HR "Employee" profile the
                // moment someone becomes a member of an organization (covers
                // both the org creator and anyone accepting an invite).
                organizationHooks: {
                    afterAddMember: async ({ member, user, organization: org }) => {
                        await dbConnect();

                        // If an admin already created an "invited" Employee row
                        // for this email (via createEmployee.ts), just link it
                        // to the newly-created Better Auth account.
                        const invited = await Employee.findOne({
                            email: user.email.toLowerCase(),
                            organizationId: org.id,
                            userId: null,
                        });

                        if (invited) {
                            invited.userId = member.userId;
                            invited.status = "active";
                            await invited.save();
                            return;
                        }

                        // No pre-created record (e.g. this user created/owns the
                        // organization itself) - create a fresh HR profile.
                        const alreadyLinked = await Employee.findOne({ userId: member.userId });
                        if (alreadyLinked) return;

                        const [firstName, ...rest] = (user.name || user.email.split("@")[0]).split(" ");

                        await Employee.create({
                            userId: member.userId,
                            organizationId: org.id,
                            firstName: firstName || "New",
                            lastName: rest.join(" ") || "Employee",
                            email: user.email,
                            role: member.role === "owner" || member.role === "admin" ? "Manager" : "Employee",
                            employmentDate: new Date(),
                            status: "active",
                        });
                    },
                },
            }),

            // --- Platform-level administration (Rafal / SaaS operator) ---
            // Separate axis from organization roles above: ban/unban users,
            // impersonate for support, list all users across every org.
            admin({
                defaultRole: "user",
                adminRoles: ["admin"],
            }),
        ],

        secret: process.env.BETTER_AUTH_SECRET,
        trustedOrigins: [process.env.BETTER_AUTH_URL ?? "http://localhost:3000"],
    });
}

type AppAuth = ReturnType<typeof createAuth>;
let _auth: AppAuth | undefined;

export async function getAuth(): Promise<AppAuth> {
    if (_auth) return _auth;

    await dbConnect();

    const db = mongoose.connection.db;
    if (!db) throw new Error("MongoDB connection.db is not available after dbConnect()");

    _auth = createAuth(db);

    return _auth;
}