"use client";

import { Suspense, useState } from "react";
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
import { getCurrentEmployeeRole } from "@/actions/shared/getCurrentEmployeeRole";
import AuthCard from "../_components/AuthCard/AuthCard";

function SignInForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const callbackURL = searchParams.get("callbackURL");

    const [isSubmitting, setIsSubmitting] = useState(false);

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

        setIsSubmitting(true);

        try {
            const { data: signInData, error: signInError } =
                await authClient.signIn.email({
                    email: form.values.email,
                    password: form.values.password,
                });

            if (signInError || !signInData) {
                notifications.show({
                    title: "Sign in failed",
                    message: signInError?.message || "Invalid email or password.",
                    color: "red",
                    icon: <IconX />,
                });
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
                    notifications.show({
                        title: "No company found",
                        message:
                            "Your account isn't linked to a company yet. Contact your administrator.",
                        color: "red",
                        icon: <IconX />,
                    });
                    return;
                }
            }

            const { success, role } = await getCurrentEmployeeRole();
            if (success && role === "Employee") {
                window.location.href = "/me";
            } else {
                window.location.href = "/team";
            }

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
                    />
                    <PasswordInput
                        label="Password"
                        placeholder="Your password"
                        {...form.getInputProps("password")}
                    />

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