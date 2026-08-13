"use client";

import { useState } from "react";
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Checkbox,
  Collapse,
  Container,
  Divider,
  Group,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  Title,
} from "@mantine/core";
import {
  IconChevronLeft,
  IconChevronRight,
  IconDownload,
  IconFilter,
  IconPlus,
  IconSearch,
} from "@tabler/icons-react";
import Link from "next/link";

export default function RequestsPage() {
  const [filtersOpen, setFiltersOpen] = useState(false);

  return (
    <Container size="xl" py="lg" px={{ base: "xs", sm: "md" }}>
      <Stack gap="lg">
        <Group justify="space-between" align="center" wrap="wrap" gap="md">
          <div>
            <Title order={2} fw={700}>
              Leave Requests
            </Title>
            <Badge variant="light" color="blue" size="md" mt="xs">
              10 requests
            </Badge>
          </div>

          <Group gap="sm" justify="flex-start">
            <Button
              variant="default"
              size="sm"
              leftSection={<IconDownload size={16} />}
            >
              Export CSV
            </Button>
            <Button
              color="green"
              size="sm"
              component={Link}
              href="/leave-requests/new"
              leftSection={<IconPlus size={16} />}
            >
              New
            </Button>
          </Group>
        </Group>

        <Paper p={{ base: "sm", sm: "md" }} radius="md" withBorder>
          <Stack gap="sm">
            <Group justify="space-between" align="center" wrap="wrap" gap="sm">
              <Group gap="xs" wrap="wrap">
                <ActionIcon variant="default" size="input-xs">
                  <IconChevronLeft size={16} />
                </ActionIcon>
                <Button variant="default" size="xs">
                  August 2026
                </Button>
                <ActionIcon variant="default" size="input-xs">
                  <IconChevronRight size={16} />
                </ActionIcon>

                <Button
                  variant="default"
                  size="xs"
                  onClick={() => setFiltersOpen((o) => !o)}
                  leftSection={<IconFilter size={16} />}
                  data-active={filtersOpen || undefined}
                >
                  Filtry
                </Button>
              </Group>

              <TextInput
                placeholder="Search..."
                leftSection={<IconSearch size={16} />}
                style={{ flexGrow: 1, maxWidth: 300 }}
                w={{ base: "100%", sm: "auto" }}
              />
            </Group>

            <Collapse expanded={filtersOpen}>
              <SimpleGrid cols={{ base: 1, sm: 2, md: 4 }} spacing="xs" pt="xs">
                <Select
                  placeholder="Pending"
                  data={["Pending", "Approved", "Rejected"]}
                />
                <Select
                  placeholder="All types"
                  data={["All types", "Annual Leave"]}
                />
                <Select placeholder="All employees" data={["All employees"]} />
                <Select
                  placeholder="All departments"
                  data={["All departments", "Bar", "Kitchen"]}
                />
              </SimpleGrid>
            </Collapse>
          </Stack>
        </Paper>

        <Paper radius="md" withBorder p={0}>
          <Stack gap={0}>
            <Paper p={{ base: "sm", sm: "md" }} radius={0}>
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <Checkbox mt={4} />
                  <Avatar color="gray" radius="xl" size="md">
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

                <Group gap="xs" align="center" justify="space-between" w={{ base: "100%", sm: "auto" }}>
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

            <Paper p={{ base: "sm", sm: "md" }} radius={0}>
              <Group justify="space-between" align="flex-start" wrap="wrap" gap="sm">
                <Group gap="sm" wrap="nowrap" align="flex-start">
                  <Checkbox mt={4} />
                  <Avatar color="gray" radius="xl" size="md">
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

                <Group gap="xs" align="center" justify="space-between" w={{ base: "100%", sm: "auto" }}>
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