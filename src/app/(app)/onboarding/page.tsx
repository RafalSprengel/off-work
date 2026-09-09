"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "@mantine/form";
import {
    Button,
    TextInput,
    Stack,
    Title,
    Text,
    Container,
    Paper,
} from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { authClient } from "@/lib/auth-client";

function slugify(value: string): string {
    const base = value
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
    const suffix = Date.now().toString(36).slice(-4);
    return base ? `${base}-${suffix}` : `org-${suffix}`;
}

export default function OnboardingPage() {
    const router = useRouter();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm({
        initialValues: { companyName: "" },
        validate: {
            companyName: (value) =>
                value.trim().length < 2 ? "Company name is required" : null,
        },
    });

    async function handleSubmit() {
        const { hasErrors } = form.validate();
        if (hasErrors) return;

        setIsSubmitting(true);

        try {
            const slug = slugify(form.values.companyName);

            // 1. Create the organization (Better Auth)
            const { data: orgData, error: orgError } =
                await authClient.organization.create({
                    name: form.values.companyName,
                    slug,
                });

            if (orgError || !orgData) {
                notifications.show({
                    title: "Error",
                    message:
                        orgError?.message ||
                        "Failed to create your organization.",
                    color: "red",
                });
                return;
            }

            // 2. Set it as the active organization
            await authClient.organization.setActive({
                organizationId: orgData.id,
            });

            // 3. Hook afterAddMember in auth.ts automatically creates
            //    the Employee profile in MongoDB with isOwner: true

            notifications.show({
                title: "Success",
                message: "Your organization has been created!",
                color: "green",
            });

            router.replace("/team");
        } catch (err) {
            notifications.show({
                title: "Error",
                message: "An unexpected error occurred.",
                color: "red",
            });
        } finally {
            setIsSubmitting(false);
        }
    }

    return (
        <Container size="xs" mt="xl">
            <Paper p="xl" withBorder>
                <Title order={2} mb="md">
                    Create your organization
                </Title>
                <Text c="dimmed" mb="lg">
                    Enter your company name to get started with Off-Work.
                </Text>

                <Stack>
                    <TextInput
                        label="Company name"
                        placeholder="e.g. Acme Corp"
                        required
                        {...form.getInputProps("companyName")}
                    />
                    <Button
                        onClick={handleSubmit}
                        loading={isSubmitting}
                        fullWidth
                    >
                        Create organization
                    </Button>
                </Stack>
            </Paper>
        </Container>
    );
}