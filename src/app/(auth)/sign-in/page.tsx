"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Alert,
    Anchor,
    Button,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconMail } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { getCurrentEmployeeRole } from "@/actions/shared/getCurrentEmployeeRole";
import AuthCard from "../_components/AuthCard/AuthCard";

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackURL = searchParams.get("callbackURL");

    const [signInError, setSignInError] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [signInErrorCode, setSignInErrorCode] = useState<string | null>(null);

    const form = useForm({
        initialValues: {
            email: "",
            password: "",
        },
        validate: {
            email: (value) =>
                /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email",
            password: (value) => (value ? null : "Password is required"),
        },
    });

    async function handleSubmit() {
        const { hasErrors } = form.validate();
        if (hasErrors) return;

        setSignInError(null);
        setIsSubmitting(true);

        try {
            const { data: signInData, error: signInError } =
                await authClient.signIn.email({
                    email: form.values.email,
                    password: form.values.password,
                });

            if (signInError || !signInData) {
                // Provide a helpful message when the email is not yet verified
                if (signInError?.code === "EMAIL_NOT_VERIFIED") {
                    setSignInErrorCode("EMAIL_NOT_VERIFIED");
                    setSignInError(
                        "Please verify your email address first. Check your inbox for the verification link, or request a new one."
                    );
                } else {
                    setSignInErrorCode(null);
                    setSignInError(signInError?.message || "Invalid email or password.");
                }
                return;
            }

            if (callbackURL) {
                // e.g. returning to /accept-invitation/[id] - that page handles
                // setting the active organization once the invite is accepted.
                router.push(callbackURL);
                router.refresh();
                return;
            }

            // Every server action relies on an active organization being set on
            // the session (see utils/getOrganizationId.ts) - make sure it is.
            const session = await authClient.getSession();
            const hasActiveOrg = !!session.data?.session?.activeOrganizationId;

            if (!hasActiveOrg) {
                const { data: organizations } = await authClient.organization.list();

                if (organizations && organizations.length > 0) {
                    await authClient.organization.setActive({
                        organizationId: organizations[0].id,
                    });
                } else {
                    // User has a valid session but no organization yet
                    // (e.g. just verified email). Redirect to onboarding.
                    window.location.href = "/onboarding";
                    return;
                }
            }

            // getCurrentEmployeeRole uses disableCookieCache internally to
            // always fetch a fresh session, so the cookie cache is bypassed
            // only for this one call – no need to pass userId from the client.
            const { success, role, error } = await getCurrentEmployeeRole({ freshSession: true });

            console.log("[sign-in] getCurrentEmployeeRole result:", { success, role, error });

            if (success && role === "Employee") {
                window.location.href = "/me";
                return;
            }

            if (success && role === "Manager") {
                window.location.href = "/team";
                return;
            }

            // Account deactivated or no employee profile — sign out and inform the user
            if (error === "Account is deactivated") {
                await authClient.signOut();
                await authClient.clearCache();
                setIsSubmitting(false);
                setSignInError(
                    "Your account has been deactivated. Contact your administrator for more information."
                );
                return;
            }

            // Fallback if getCurrentEmployeeRole fails - redirect to /team anyway.
            // The dashboard layout will redirect back to /sign-in if the session
            // is invalid.
            console.error("[sign-in] getCurrentEmployeeRole failed, falling back to /team:", error);
            window.location.href = "/team";
        } catch (err) {
            notifications.show({
                title: "Error",
                message: err instanceof Error ? err.message : "An unexpected error occurred",
                color: "red",
                icon: <IconX />,
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <AuthCard title="Welcome back" subtitle="Log in to your Off-Work account.">
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
            >
                <Stack gap="md">
                    <TextInput
                        label="Email"
                        placeholder="you@company.com"
                        {...form.getInputProps("email")}
                        onChange={(e) => {
                            form.getInputProps("email").onChange(e);
                            if (signInError) {
                                setSignInError(null);
                                setSignInErrorCode(null);
                            }
                        }}
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        {...form.getInputProps("password")}
                        onChange={(e) => {
                            form.getInputProps("password").onChange(e);
                            if (signInError) {
                                setSignInError(null);
                                setSignInErrorCode(null);
                            }
                        }}
                    />

                    {signInError && (
                        <Alert
                            variant="light"
                            title={signInErrorCode === "EMAIL_NOT_VERIFIED" ? "Email not verified" : "Sign in failed"}
                            color={signInErrorCode === "EMAIL_NOT_VERIFIED" ? "blue" : "red"}
                            icon={signInErrorCode === "EMAIL_NOT_VERIFIED" ? <IconMail /> : <IconAlertCircle />}
                            withCloseButton
                            closeButtonLabel="Dismiss"
                            onClose={() => {
                                setSignInError(null);
                                setSignInErrorCode(null);
                            }}
                        >
                            {signInError}
                            {signInErrorCode === "EMAIL_NOT_VERIFIED" && (
                                <Button
                                    variant="subtle"
                                    size="xs"
                                    mt="xs"
                                    onClick={() => {
                                        authClient.sendVerificationEmail({
                                            email: form.values.email,
                                            callbackURL: "/verify-email/callback",
                                        });
                                        notifications.show({
                                            title: "Verification email sent",
                                            message: "Check your inbox for the verification link.",
                                            color: "blue",
                                        });
                                    }}
                                >
                                    Resend verification email
                                </Button>
                            )}
                        </Alert>
                    )}

                    <Button type="submit" fullWidth mt="sm" loading={isSubmitting}>
                        Log in
                    </Button>
                </Stack>
            </form>

            <Text size="sm" ta="center" mt="md">
                Don&apos;t have an account?{" "}
                <Anchor
                    component={Link}
                    href={callbackURL ? `/sign-up?callbackURL=${encodeURIComponent(callbackURL)}` : "/sign-up"}
                    fw={600}
                >
                    Sign up
                </Anchor>
            </Text>
        </AuthCard>
    );
}

export default function SignInPage() {
    return (
        <Suspense fallback={null}>
            <SignInForm />
        </Suspense>
    );
}