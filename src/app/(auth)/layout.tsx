import { Box, Center, Stack } from "@mantine/core";
import Link from "next/link";
import AuthLogo from "./_components/AuthLogo/AuthLogo";

export default function AuthLayout({
    children,
}: Readonly<{ children: React.ReactNode }>) {
    return (
        <Center mih="100svh" px="md" py="xl">
            <Stack align="center" w="100%" maw={400}>
                <Link href="/" style={{ textDecoration: "none", marginBottom: "var(--mantine-spacing-lg)" }}>
                    <AuthLogo />
                </Link>
                {children}
            </Stack>
        </Center>
    );
}