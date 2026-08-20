"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
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

function slugify(value: string): string {
    const base = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");

    const suffix = Date.now().toString(36).slice(-4);
    return base ? `${base}-${suffix}` : `org-${suffix}`;
}

export default function SignUpPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackURL = searchParams.get("callbackURL");
    const isInviteFlow = !!callbackURL;

    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        initialValues: {
            fullName: "",
            companyName: "",
            email: "",
            password: "",
            confirmPassword: "",
        },
        validate: {
            fullName: (value) => (value.trim() ? null : "Your name is required"),
            companyName: (value) =>
                isInviteFlow || value.trim() ? null : "Company name is required",
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
            const { error: signUpError } = await authClient.signUp.email({
                name: form.values.fullName,
                email: form.values.email,
                password: form.values.password,
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
                // Joining an existing company via an invitation - the
                // accept-invitation page takes it from here.
                router.push(callbackURL);
                router.refresh();
                return;
            }

            const { data: orgData, error: orgError } =
                await authClient.organization.create({
                    name: form.values.companyName,
                    slug: slugify(form.values.companyName),
                });

            if (orgError || !orgData) {
                notifications.show({
                    title: "Error",
                    message:
                        orgError?.message || "Account created, but the company setup failed.",
                    color: "red",
                    icon: <IconX />,
                });
                return;
            }

            await authClient.organization.setActive({
                organizationId: orgData.id,
            });

            notifications.show({
                title: "Welcome to Off-Work",
                message: "Your account and company have been created.",
                color: "green",
            });

            router.push("/team");
            router.refresh();
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
        <AuthCard
            title="Create your account"
            subtitle={
                isInviteFlow
                    ? "Set a password to join your team on Off-Work."
                    : "Set up your company on Off-Work in a couple of minutes."
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
                    {!isInviteFlow && (
                        <TextInput
                            label="Company name"
                            placeholder="e.g. Acme Ltd"
                            {...form.getInputProps("companyName")}
                        />
                    )}
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