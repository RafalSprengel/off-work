import { Card, Stack, Text, Title } from "@mantine/core";

interface AuthCardProps {
    title: string;
    subtitle?: string;
    children: React.ReactNode;
}

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
    return (
        <Card withBorder radius="md" padding="xl" w="100%">
            <Stack gap="lg">
                <Stack gap={4}>
                    <Title order={2} fz="1.5rem">
                        {title}
                    </Title>
                    {subtitle && (
                        <Text size="sm" c="dimmed">
                            {subtitle}
                        </Text>
                    )}
                </Stack>
                {children}
            </Stack>
        </Card>
    );
}