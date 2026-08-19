// src/app/(app)/components/AppShellClient/AppShellClient.tsx
"use client";

import {
  ActionIcon,
  AppShell,
  Avatar,
  Box,
  Burger,
  Drawer,
  Group,
  Menu,
  Text,
  UnstyledButton,
} from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import {
  IconChevronDown,
  IconLogout,
  IconSettings,
  IconUser,
} from "@tabler/icons-react";
import SidebarContent from "../SidebarContent/SidebarContent";
import styles from "./AppShellClient.module.css";
import { NotificationsDropdown } from "../NotificationsDropdown/NotificationsDropdown";

export default function LayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
      layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: "sm",
        collapsed: { mobile: !opened },
      }}
      padding="md"
    >
      <AppShell.Header
        className={styles.header}
        bg="light-dark(var(--mantine-color-white), #0d0d0d)"
        style={{ zIndex: 100 }}
      >
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              className={styles.burger}
              aria-label="Toggle navigation"
            />
            <Box hiddenFrom="sm" className={styles.logo}>
              OFF-WORK
            </Box>
          </Group>

          <Group gap="sm">
            {/* Notifications Dropdown */}
            <NotificationsDropdown />

            <Menu shadow="md" width={200} position="bottom-end">
              <Menu.Target>
                <UnstyledButton>
                  <Group gap={8}>
                    <Avatar color="blue" radius="xl" size="sm">
                      RS
                    </Avatar>
                    <Box visibleFrom="sm">
                      <Text size="sm" fw={600} lh={1.2}>
                        Rafał Sprengel
                      </Text>
                      <Text size="xs" c="dimmed" lh={1}>
                        Admin
                      </Text>
                    </Box>
                    <IconChevronDown size={14} style={{ opacity: 0.5 }} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>Account</Menu.Label>
                <Menu.Item leftSection={<IconUser size={14} />}>
                  Profile
                </Menu.Item>
                <Menu.Item leftSection={<IconSettings size={14} />}>
                  Settings
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item color="red" leftSection={<IconLogout size={14} />}>
                  Logout
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={styles.sidebar} visibleFrom="sm">
        <SidebarContent onClose={close} isMobile={false} />
      </AppShell.Navbar>

      <Drawer
        opened={opened}
        onClose={close}
        size={280}
        withCloseButton={false}
        hiddenFrom="sm"
        transitionProps={{ duration: 200, transition: "slide-right" }}
        styles={{
          body: { padding: 0, height: "100%" },
          content: { backgroundColor: "#0d0d0d", color: "#fff" },
          overlay: { backdropFilter: "blur(4px)" },
        }}
      >
        <SidebarContent onClose={close} isMobile={true} />
      </Drawer>

      <AppShell.Main className={styles.main}>{children}</AppShell.Main>
    </AppShell>
  );
}