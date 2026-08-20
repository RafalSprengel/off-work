import { Group, Text, ThemeIcon } from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";

export default function AuthLogo() {
    return (
        <Group gap={10} align="center" justify="center">
            <ThemeIcon
                size={32}
                radius="md"
                variant="gradient"
                gradient={{ from: "teal", to: "green", deg: 135 }}
            >
                <IconBriefcase size={18} stroke={2.2} />
            </ThemeIcon>
            <Text
                fw={800}
                size="lg"
                tt="uppercase"
                ff="monospace"
                style={{ letterSpacing: "1.2px" }}
            >
                OFF<Text span c="teal">-</Text>WORK
            </Text>
        </Group>
    );
}