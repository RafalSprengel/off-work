import { Box, Container, Group, Text } from "@mantine/core";
import { IconBriefcase } from "@tabler/icons-react";
import styles from "./Footer.module.css";

export default function Footer() {
  const year = new Date().getFullYear();

  return (
    <Box component="footer" className={styles.footer}>
      <Container size="lg" className={styles.inner}>
        <Group gap={8} align="center">
          <IconBriefcase size={16} stroke={2.2} color="#10b981" />
          <Text size="sm" fw={600} c="dimmed">
            Off-Work
          </Text>
        </Group>

        <Text size="sm" c="dimmed">
          © {year} Off-Work. All rights reserved.
        </Text>
      </Container>
    </Box>
  );
}
