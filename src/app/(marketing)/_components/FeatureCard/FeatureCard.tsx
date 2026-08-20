import { Box, Card, Text } from "@mantine/core";
import type { Icon, IconProps } from "@tabler/icons-react";
import type { ForwardRefExoticComponent, RefAttributes } from "react";
import styles from "./FeatureCard.module.css";

interface FeatureCardProps {
  icon: ForwardRefExoticComponent<IconProps & RefAttributes<Icon>>;
  title: string;
  description: string;
}

export default function FeatureCard({
  icon: IconComponent,
  title,
  description,
}: FeatureCardProps) {
  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      className={styles.card}
    >
      <Box className={styles.iconWrap}>
        <IconComponent size={22} stroke={1.75} />
      </Box>
      <Text fw={600} size="md" mt="md" mb={4}>
        {title}
      </Text>
      <Text size="sm" c="dimmed" lh={1.5}>
        {description}
      </Text>
    </Card>
  );
}
