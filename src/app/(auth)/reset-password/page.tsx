"use client";

import {
  Alert,
  Anchor,
  Button,
  PasswordInput,
  Stack,
  Text,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { notifications } from "@mantine/notifications";
import { IconAlertCircle, IconCheck, IconX } from "@tabler/icons-react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { authClient } from "@/lib/auth-client";
import AuthCard from "../_components/AuthCard/AuthCard";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const form = useForm({
    initialValues: {
      password: "",
      confirmPassword: "",
    },
    validate: {
      password: (value) =>
        value.length >= 8 ? null : "Password must be at least 8 characters",
      confirmPassword: (value, values) =>
        value === values.password ? null : "Passwords do not match",
    },
  });

  async function handleSubmit() {
    if (!token) return;
    const { hasErrors } = form.validate();
    if (hasErrors) return;

    setIsSubmitting(true);
    try {
      const { error } = await authClient.resetPassword({
        newPassword: form.values.password,
        token,
      });

      if (error) {
        if (error.code === "INVALID_TOKEN" || error.code === "TOKEN_EXPIRED") {
          notifications.show({
            title: "Reset link invalid",
            message:
              "This reset link is invalid or has expired. Please request a new one.",
            color: "red",
            icon: <IconX />,
          });
        } else {
          notifications.show({
            title: "Reset failed",
            message:
              error.message ||
              "Could not reset your password. Please try again.",
            color: "red",
            icon: <IconX />,
          });
        }
        return;
      }

      setIsSuccess(true);
      notifications.show({
        title: "Password updated",
        message: "Your password has been reset. You can now sign in.",
        color: "green",
        icon: <IconCheck />,
      });
      setTimeout(() => {
        router.push("/sign-in");
      }, 1500);
    } catch (err) {
      notifications.show({
        title: "Error",
        message:
          err instanceof Error ? err.message : "An unexpected error occurred",
        color: "red",
        icon: <IconX />,
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (!token) {
    return (
      <AuthCard
        title="Invalid reset link"
        subtitle="This link is missing a reset token."
      >
        <Alert
          icon={<IconAlertCircle size={18} />}
          color="red"
          variant="light"
          mb="md"
        >
          This password reset link is invalid or has expired. Please contact
          your administrator to request a new one.
        </Alert>
        <Button component={Link} href="/sign-in" variant="default" fullWidth>
          Go to login
        </Button>
      </AuthCard>
    );
  }

  if (isSuccess) {
    return (
      <AuthCard
        title="Password updated"
        subtitle="You'll be redirected to sign in shortly."
      >
        <Stack align="center" py="lg">
          <IconCheck size={32} color="var(--mantine-color-green-6)" />
        </Stack>
        <Button component={Link} href="/sign-in" variant="default" fullWidth>
          Go to login
        </Button>
      </AuthCard>
    );
  }

  return (
    <AuthCard
      title="Reset your password"
      subtitle="Enter a new password for your account."
    >
      <form
        onSubmit={(event) => {
          event.preventDefault();
          handleSubmit();
        }}
      >
        <Stack gap="md">
          <PasswordInput
            label="New password"
            placeholder="At least 8 characters"
            {...form.getInputProps("password")}
          />
          <PasswordInput
            label="Confirm new password"
            placeholder="Repeat your password"
            {...form.getInputProps("confirmPassword")}
          />

          <Button type="submit" fullWidth mt="sm" loading={isSubmitting}>
            Reset password
          </Button>
        </Stack>
      </form>

      <Text size="sm" ta="center" mt="md">
        Remember your password?{" "}
        <Anchor component={Link} href="/sign-in" fw={600}>
          Log in
        </Anchor>
      </Text>
    </AuthCard>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
