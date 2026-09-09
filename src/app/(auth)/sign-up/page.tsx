"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    Anchor,
    Button,
    PasswordInput,
    Stack,
    Text,
    TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import AuthCard from "../_components/AuthCard/AuthCard";

function SignUpForm() {
    const searchParams = useSearchParams();
    const callbackURL = searchParams.get("callbackURL");
    const isInviteFlow = !!callbackURL;

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSignedUp, setIsSignedUp] = useState(false);
    const [signUpEmail, setSignUpEmail] = useState("");

    const form = useForm({
        initialValues: {
            fullName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validate: {
            fullName: (value) => (value.trim() ? null : "Your name is required"),
            email: (value) =>
                /^\S+@\S+\.\S+$/.test(value) ? null : "Enter a valid email",
            password: (value) =>
                value.length >= 8 ? null : "Password must be at least 8 characters",
            confirmPassword: (value, values) =>
                value === values.password ? null : "Passwords do not match",
        },
    });

    async function handleSubmit() {
        const { hasErrors } = form.validate();
        if (hasErrors) return;

        setIsSubmitting(true);

        try {
            const { error: signUpError } =
                await authClient.signUp.email({
                    name: form.values.fullName,
                    email: form.values.email,
                    password: form.values.password,
                    callbackURL: "/verify-email/callback",
                });

            if (signUpError) {
                if (
                    signUpError.code === "USER_ALREADY_EXISTS" ||
                    signUpError.code === "USER_ALREADY_EXISTS_USE_ANOTHER_EMAIL"
                ) {
                    form.setFieldError("email", "An account with this email already exists.");
                } else {
                    notifications.show({
                        title: "Sign up failed",
                        message: signUpError.message || "Could not create your account.",
                        color: "red",
                        icon: <IconX />,
                    });
                }
                return;
            }

            if (isInviteFlow) {
                // Invite flow — redirect to accept the invitation
                window.location.href = callbackURL;
                return;
            }

            // New org flow — user is created but NOT logged in yet
            // (requireEmailVerification blocks auto-sign-in).
            // After email verification, they'll be redirected to /onboarding.

            setSignUpEmail(form.values.email);
            setIsSignedUp(true);
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

    if (isSignedUp) {
        return (
            <AuthCard
                title="Check your email"
                subtitle={`We sent a verification link to ${signUpEmail}. Click the link to verify your email, then you can set up your organization.`}
            >
                <Stack gap="md">
                    <Text c="dimmed" size="sm">
                        You won't be able to sign in until you verify your email address.
                    </Text>

                    <Button
                        fullWidth
                        variant="light"
                        onClick={() => {
                            // Allow resending the verification email
                            authClient.sendVerificationEmail({
                                email: signUpEmail,
                                callbackURL: "/verify-email/callback",
                            });
                            notifications.show({
                                title: "Verification email sent",
                                message: "Check your inbox for the new verification link.",
                                color: "blue",
                            });
                        }}
                    >
                        Resend verification email
                    </Button>

                    <Text size="sm" ta="center" mt="md">
                        <Anchor
                            component={Link}
                            href="/sign-in"
                            fw={600}
                        >
                            Go to sign in
                        </Anchor>
                    </Text>
                </Stack>
            </AuthCard>
        );
    }

    return (
        <AuthCard
            title="Create your account"
            subtitle={
                isInviteFlow
                    ? "Set a password to join your team on Off-Work."
                    : "Create your account to get started."
            }
        >
            <form
                onSubmit={(event) => {
                    event.preventDefault();
                    handleSubmit();
                }}
            >
                <Stack gap="md">
                    <TextInput
                        label="Full name"
                        placeholder="e.g. John Smith"
                        {...form.getInputProps("fullName")}
                    />
                    <TextInput
                        label="Work email"
                        placeholder="you@company.com"
                        {...form.getInputProps("email")}
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="At least 8 characters"
                        {...form.getInputProps("password")}
                    />
                    <PasswordInput
                        label="Confirm password"
                        placeholder="Repeat your password"
                        {...form.getInputProps("confirmPassword")}
                    />

                    <Button type="submit" fullWidth mt="sm" loading={isSubmitting}>
                        Create account
                    </Button>
                </Stack>
            </form>

            <Text size="sm" ta="center" mt="md">
                Already have an account?{" "}
                <Anchor
                    component={Link}
                    href={isInviteFlow ? `/sign-in?callbackURL=${encodeURIComponent(callbackURL)}` : "/sign-in"}
                    fw={600}
                >
                    Log in
                </Anchor>
            </Text>
        </AuthCard>
    );
}

export default function SignUpPage() {
    return (
        <Suspense fallback={null}>
            <SignUpForm />
        </Suspense>
    );
}