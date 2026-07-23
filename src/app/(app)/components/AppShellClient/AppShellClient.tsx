"use client";

import { AppShell, Burger, Group, Drawer, Box } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import SidebarContent from '../SidebarContent/SidebarContent';
import styles from './AppShellClient.module.css';

export default function LayoutClient({ children }: { children: React.ReactNode }) {
  const [opened, { toggle, close }] = useDisclosure();

  return (
    <AppShell
     layout="alt"
      header={{ height: 60 }}
      navbar={{
        width: 280,
        breakpoint: 'sm',
        collapsed: { mobile: true },
      }}
      padding="md"
    >
      <AppShell.Header className={styles.header}>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger
              opened={opened}
              onClick={toggle}
              hiddenFrom="sm"
              size="sm"
              color="#fff"
            />
            <Box hiddenFrom="sm" className={styles.logo}>OFF-WORK</Box>
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar className={styles.sidebar}>
        <SidebarContent onClose={close} isMobile={false} />
      </AppShell.Navbar>

      <Drawer
        opened={opened}
        onClose={close}
        size={280}
        withCloseButton={false}
        transitionProps={{ duration: 200, transition: 'slide-right' }}
        styles={{
          body: { padding: 0, height: '100%' },
          content: { backgroundColor: '#0d0d0d', color: '#fff' },
          overlay: { backdropFilter: 'blur(4px)' }
        }}
      >
        <SidebarContent onClose={close} isMobile={true} />
      </Drawer>

      <AppShell.Main className={styles.main}>
        {children}
      </AppShell.Main>
    </AppShell>
  );
}