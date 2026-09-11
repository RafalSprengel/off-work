"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Text, Loader, Center, Stack, Title, Button } from "@mantine/core";
import { authClient } from "@/lib/auth-client";

function CallbackHandler() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const error = searchParams.get("error");
    const [status, setStatus] = useState<"loading" | "error">("loading");
    const [errorMessage, setErrorMessage] = useState("");

    useEffect(() => {
        if (error) {
            setStatus("error");
            setErrorMessage(
                error === "TOKEN_EXPIRED"
                    ? "The verification link has expired. Please sign in to request a new one."
                    : `Email verification failed: ${error}. Please try signing in again.`
            );
            return;
        }

        async function handleVerification() {
            try {
                // 1. Ensure we have a valid session (auto-sign-in should have happened)
                const { data: sessionData } = await authClient.getSession();

                if (!sessionData?.user) {
                    // Not signed in — redirect to sign-in page
                    router.replace("/sign-in");
                    return;
                }

                // 2. If user already has an active org, go straight to dashboard
                if (sessionData.session?.activeOrganizationId) {
                    router.replace("/team");
                    return;
                }

                // 3. No organization yet — redirect to onboarding page
                router.replace("/onboarding");
            } catch (err) {
                setStatus("error");
                setErrorMessage(
                    err instanceof Error
                        ? err.message
                        : "An unexpected error occurred."
                );
            }
        }

        handleVerification();
    }, [error, router]);

    if (status === "error") {
        return (
            <Center mih="100vh">
                <Stack gap="md" align="center">
                    <Title order={3}>Something went wrong</Title>
                    <Text c="dimmed" ta="center" maw={400}>
                        {errorMessage}
                    </Text>
                    <Button
                        component="a"
                        href="/sign-in"
                        variant="light"
                        mt="sm"
                    >
                        Go to sign in
                    </Button>
                </Stack>
            </Center>
        );
    }

    return (
        <Center mih="100vh">
            <Stack gap="md" align="center">
                <Loader size="lg" />
                <Title order={3}>Verifying your email…</Title>
                <Text c="dimmed">Please wait a moment.</Text>
            </Stack>
        </Center>
    );
}

export default function VerificationCallbackPage() {
    return (
        <Suspense fallback={null}>
            <CallbackHandler />
        </Suspense>
    );
}