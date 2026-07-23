import { Stack, Group, UnstyledButton, Text, Avatar, Divider } from '@mantine/core';
import { 
  IconX, IconLayoutDashboard, IconCalendar, 
  IconUsers, IconFileDescription, IconSettings, IconLogout 
} from '@tabler/icons-react'; 
import styles from './SidebarContent.module.css';

interface SidebarContentProps {
  onClose: () => void;
  isMobile: boolean;
}

export default function SidebarContent({ onClose, isMobile }: SidebarContentProps) {
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
              <Text size="sm" fw={500}>Firma Krzak</Text>
            </Group>
            <span className={styles.arrow}>↕</span>
          </Group>
        </UnstyledButton>
      </div>

      <div className={styles.scrollSection}>
        <Stack gap="xs" px="md">
          <Text size="xs" fw={700} c="dimmed" lts="1px">MENU</Text>
          
          <UnstyledButton className={`${styles.menuItem} ${styles.active}`}>
            <Group gap="sm">
              <IconLayoutDashboard size={18} />
              <Text size="sm">Dashboard</Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton className={styles.menuItem}>
            <Group gap="sm">
              <IconFileDescription size={18} />
              <Text size="sm">Wnioski o nieobecność</Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton className={styles.menuItem}>
            <Group gap="sm">
              <IconCalendar size={18} />
              <Text size="sm">Twój kalendarz</Text>
            </Group>
          </UnstyledButton>

          <Text size="xs" fw={700} c="dimmed" lts="1px" mt="md">ADMINISTRACJA</Text>

          <UnstyledButton className={styles.menuItem}>
            <Group gap="sm">
              <IconUsers size={18} />
              <Text size="sm">Struktura firmy</Text>
            </Group>
          </UnstyledButton>

          <UnstyledButton className={styles.menuItem}>
            <Group gap="sm">
              <IconSettings size={18} />
              <Text size="sm">Ustawienia</Text>
            </Group>
          </UnstyledButton>
        </Stack>
      </div>

      <div className={styles.bottomSection}>
        <Divider color="#222" my="md" />
        <Group justify="space-between" px="md" wrap="nowrap">
          <Group gap="xs" wrap="nowrap">
            <Avatar color="gray" radius="xl">RS</Avatar>
            <div style={{ overflow: 'hidden' }}>
              <Text size="sm" fw={600} truncate>Rafał Sprengel</Text>
              <Text size="xs" c="dimmed" truncate>rafal@sprengel.com</Text>
            </div>
          </Group>
          <UnstyledButton className={styles.logoutBtn}>
            <IconLogout size={18} />
          </UnstyledButton>
        </Group>
      </div>
    </div>
  );
}