"use client";

import {
  ActionIcon,
  Avatar,
  Divider,
  Group,
  Stack,
  Text,
  UnstyledButton,
  useMantineColorScheme,
} from "@mantine/core";
import {
  IconCalendar,
  IconFileDescription,
  IconLayoutDashboard,
  IconLogout,
  IconMoon,
  IconSettings,
  IconSun,
  IconUsers,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import styles from "./SidebarContent.module.css";

interface SidebarContentProps {
  onClose: () => void;
  isMobile: boolean;
}

export default function SidebarContent({
  onClose,
  isMobile,
}: SidebarContentProps) {
  const pathname = usePathname();
  const { colorScheme, setColorScheme } = useMantineColorScheme();

  const isActive = (path: string) =>
    pathname.startsWith(path) ? true : undefined;

  const toggleColorScheme = () => {
    setColorScheme(colorScheme === "dark" ? "light" : "dark");
  };

  return (
    <div className={styles.wrapper}>
      <div className={styles.topSection}>
        <Group justify="space-between" align="center" w="100%">
          <div className={styles.brand}>
            <span className={styles.greenDot}>●</span> OFF-WORK
          </div>
          {isMobile && (
            <UnstyledButton onClick={onClose} className={styles.closeBtn}>
              <IconX size={20} />
            </UnstyledButton>
          )}
        </Group>

        <UnstyledButton className={styles.companySelector}>
          <Group justify="space-between" w="100%">
            <Group gap="xs">
              <span className={styles.companyIcon}>🏢</span>
              <Text size="sm" fw={500}>
                Company X
              </Text>
            </Group>
            <span className={styles.arrow}>↕</span>
          </Group>
        </UnstyledButton>
      </div>

      <div className={styles.scrollSection}>
        <Stack gap="xs" px="md">
          <Text size="xs" fw={700} c="dimmed" lts="1px">
            MENU
          </Text>

          <UnstyledButton
            className={styles.menuItem}
            data-active={isActive("/dashboard")}
            component={Link}
            href="/dashboard"
          >
            <Group gap="sm">
              <IconLayoutDashboard size={18} />
              <Text size="sm">Dashboard</Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton
            className={styles.menuItem}
            data-active={isActive("/leave-requests")}
            component={Link}
            href="/leave-requests"
          >
            <Group gap="sm">
              <IconFileDescription size={18} />
              <Text size="sm">Leave Requests</Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton
            className={styles.menuItem}
            data-active={isActive("/calendar")}
            component={Link}
            href="/calendar"
          >
            <Group gap="sm">
              <IconCalendar size={18} />
              <Text size="sm">Calendar</Text>
            </Group>
          </UnstyledButton>

          <Text size="xs" fw={700} c="dimmed" lts="1px" mt="md">
            SETTINGS
          </Text>

          <UnstyledButton
            className={styles.menuItem}
            data-active={isActive("/departments")}
            component={Link}
            href="/departments"
          >
            <Group gap="sm">
              <IconUsers size={18} />
              <Text size="sm">Departments</Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton className={styles.menuItem}>
            <Group gap="sm">
              <IconSettings size={18} />
              <Text size="sm">Settings</Text>
            </Group>
          </UnstyledButton>
        </Stack>
      </div>

      <div className={styles.bottomSection}>
        <Divider color="#222" my="md" />
        <Group justify="space-between" px="md" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Avatar color="gray" radius="xl">
              RS
            </Avatar>
            <div style={{ overflow: "hidden" }}>
              <Text size="sm" fw={600} truncate>
                Rafał Sprengel
              </Text>
              <Text size="xs" c="dimmed" truncate>
                rafal.sprengel@gmail.com
              </Text>
            </div>
          </Group>
          <Group gap={4} wrap="nowrap">
            <ActionIcon
              onClick={toggleColorScheme}
              variant="subtle"
              aria-label="Toggle color scheme"
              className={styles.themeBtn}
            >
              {colorScheme === "dark" ? (
                <IconSun size={18} />
              ) : (
                <IconMoon size={18} />
              )}
            </ActionIcon>
            <UnstyledButton className={styles.logoutBtn}>
              <IconLogout size={18} />
            </UnstyledButton>
          </Group>
        </Group>
      </div>
    </div>
  );
}
