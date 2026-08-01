'use client';

import {
  Container,
  Stack,
  Group,
  Title,
  Text,
  Button,
  Paper,
  TextInput,
  Select,
  Badge,
  Avatar,
  Checkbox,
  ActionIcon,
  Divider,
} from '@mantine/core';
import {
  IconSearch,
  IconPlus,
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
} from '@tabler/icons-react';
import Link from 'next/link';

export default function RequestsPage() {
  return (
    <Container size="xl" py="lg">
      <Stack gap="lg">
        {/* 1. NAGŁÓWEK */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} fw={700}>
              Leave Requests
            </Title>
            <Badge variant="light" color="blue" size="md" mt="xs">
              10 requests
            </Badge>
          </div>

          <Group gap="sm">
            <Button variant="default" leftSection={<IconDownload size={16} />}>
              Export CSV
            </Button>
            <Button
              color="green"
              component={Link}
              href="/leave-requests/new"
              leftSection={<IconPlus size={16} />}
            >
              New
            </Button>
          </Group>
        </Group>

        {/* 2. PANEL FILTRÓW */}
        <Paper p="md" radius="md" withBorder>
          <Stack gap="sm">
            {/* Wiersz z opcjami wyboru */}
            <Group grow gap="xs">
              <Select placeholder="Pending" data={['Pending', 'Approved', 'Rejected']} />
              <Select placeholder="All types" data={['All types', 'Annual Leave']} />
              <Select placeholder="All employees" data={['All employees']} />
              <Select placeholder="All departments" data={['All departments', 'Bar', 'Kitchen']} />
            </Group>

            {/* Wiersz z nawigacją daty */}
            <Group gap="xs">
              <ActionIcon variant="default" size="input-sm">
                <IconChevronLeft size={16} />
              </ActionIcon>
              <Button variant="default" size="xs">
                August 2026
              </Button>
              <ActionIcon variant="default" size="input-sm">
                <IconChevronRight size={16} />
              </ActionIcon>
              <Button variant="subtle" size="xs">
                Entire period
              </Button>
            </Group>

            {/* Pole wyszukiwania umieszczone na samym dole */}
            <TextInput
              placeholder="Search..."
              leftSection={<IconSearch size={16} />}
            />
          </Stack>
        </Paper>

        {/* 3. LISTA WNIOSKÓW */}
        <Paper radius="md" withBorder p={0}>
          <Stack gap={0}>
            {/* Wiersz 1 */}
            <Paper p="md" radius={0}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                  <Checkbox />
                  <Avatar color="gray" radius="xl">
                    BB
                  </Avatar>
                  <div>
                    <Text size="sm" fw={600}>
                      Annual Leave
                    </Text>
                    <Text size="xs" c="dimmed">
                      Benjamin Brown · 2026-08-17 – 2026-08-25 · 7 days
                    </Text>
                    <Text size="xs" c="dimmed">
                      Management
                    </Text>
                  </div>
                </Group>

                <Group gap="md">
                  <Text size="xs" c="dimmed">
                    01/07/2026
                  </Text>
                  <Badge variant="light" color="gray">
                    Pending
                  </Badge>
                </Group>
              </Group>
            </Paper>

            <Divider />

            {/* Wiersz 2 */}
            <Paper p="md" radius={0}>
              <Group justify="space-between" wrap="nowrap">
                <Group gap="md" wrap="nowrap">
                  <Checkbox />
                  <Avatar color="gray" radius="xl">
                    NW
                  </Avatar>
                  <div>
                    <Text size="sm" fw={600}>
                      Annual Leave
                    </Text>
                    <Text size="xs" c="dimmed">
                      Nathan White · 2026-08-13 – 2026-08-18 · 4 days
                    </Text>
                    <Text size="xs" c="dimmed">
                      Bar
                    </Text>
                  </div>
                </Group>

                <Group gap="md">
                  <Text size="xs" c="dimmed">
                    01/07/2026
                  </Text>
                  <Badge variant="light" color="gray">
                    Pending
                  </Badge>
                </Group>
              </Group>
            </Paper>
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}