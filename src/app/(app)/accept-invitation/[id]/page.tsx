"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Alert, Button, Center, Loader, Stack } from "@mantine/core";
import { IconAlertCircle, IconCheck } from "@tabler/icons-react";
import { authClient } from "@/lib/auth-client";
import { getCurrentEmployeeRole } from "@/actions/shared/getCurrentEmployeeRole";
import AuthCard from "../../../(auth)/_components/AuthCard/AuthCard";
type Status = "checking" | "signedOut" | "accepting" | "error" | "success";

export default function AcceptInvitationPage() {
    const params = useParams<{ id: string }>();
    const invitationId = params.id;
    const router = useRouter();

    const [status, setStatus] = useState<Status>("checking");
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        async function run() {
            const session = await authClient.getSession();

            if (!session.data?.user) {
                setStatus("signedOut");
                return;
            }

            setStatus("accepting");

            const { data, error } = await authClient.organization.acceptInvitation({
                invitationId,
            });

            if (error || !data) {
                setErrorMessage(
                    error?.message ||
                    "This invitation is no longer valid. It may have expired, already been used, or been sent to a different email address."
                );
                setStatus("error");
                return;
            }

            // Better Auth sets the accepted organization as active automatically,
            // but we set it explicitly too in case the response shape changes.
            const organizationId =
                (data as any)?.invitation?.organizationId ??
                (data as any)?.member?.organizationId;

            if (organizationId) {
                await authClient.organization.setActive({ organizationId });
            }

            const { success, role } = await getCurrentEmployeeRole();
            setStatus("success");

            setTimeout(() => {
                router.push(success && role === "Employee" ? "/me" : "/team");
                router.refresh();
            }, 1200);
        }

        run();
    }, [invitationId, router]);

    if (status === "checking" || status === "accepting") {
        return (
            <AuthCard
                title="Joining your team"
                subtitle="One moment while we confirm your invitation."
            >
                <Center py="lg">
                    <Loader />
                </Center>
            </AuthCard>
        );
    }

    if (status === "signedOut") {
        const callbackURL = `/accept-invitation/${invitationId}`;

        return (
            <AuthCard
                title="You've been invited to Off-Work"
                subtitle="Create an account or log in with the email address the invitation was sent to."
            >
                <Stack gap="sm">
                    <Button
                        component={Link}
                        href={`/sign-up?callbackURL=${encodeURIComponent(callbackURL)}`}
                        fullWidth
                    >
                        Create account
                    </Button>
                    <Button
                        component={Link}
                        href={`/sign-in?callbackURL=${encodeURIComponent(callbackURL)}`}
                        variant="default"
                        fullWidth
                    >
                        Log in
                    </Button>
                </Stack>
            </AuthCard>
        );
    }

    if (status === "success") {
        return (
            <AuthCard title="You're in!" subtitle="Redirecting you to your dashboard...">
                <Center py="lg">
                    <IconCheck size={32} color="var(--mantine-color-green-6)" />
                </Center>
            </AuthCard>
        );
    }

    return (
        <AuthCard title="Invitation problem" subtitle="We couldn't add you to the team.">
            <Alert icon={<IconAlertCircle size={18} />} color="red" variant="light" mb="md">
                {errorMessage}
            </Alert>
            <Button component={Link} href="/sign-in" variant="default" fullWidth>
                Go to login
            </Button>
        </AuthCard>
    );
}