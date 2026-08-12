"use client";

import { AppShell, Box, Burger, Drawer, Group } from "@mantine/core";
import { useDisclosure } from "@mantine/hooks";
import SidebarContent from "../SidebarContent/SidebarContent";
import styles from "./AppShellClient.module.css";

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