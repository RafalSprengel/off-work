"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Menu,
  Paper,
  SegmentedControl,
  Stack,
  Table,
  Text,
  Title,
  Tooltip,
} from "@mantine/core";
import {
  IconCheck,
  IconChevronRight,
  IconDotsVertical,
  IconX,
} from "@tabler/icons-react";
import Link from "next/link";
import { useState } from "react";

interface LeaveRequestItem {
  id: string;
  employee: string;
  avatar?: string;
  department: string;
  type: string;
  dates: string;
  submitted: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected";
}

export default function TeamLeaveRequestsPage() {
  const companyStats = {
    pendingApprovals: 4,
  };

  const [statusFilter, setStatusFilter] = useState<string>("Pending");

  const [requests] = useState<LeaveRequestItem[]>([
    {
      id: "1",
      employee: "Jan Kowalski",
      department: "Engineering",
      type: "Annual Leave",
      dates: "20 Aug 2026 - 27 Aug 2026",
      submitted: "Yesterday",
      days: 6,
      status: "Pending",
    },
    {
      id: "2",
      employee: "Anna Nowak",
      department: "Design",
      type: "Sick Leave",
      dates: "01 Sep 2026 - 02 Sep 2026",
      submitted: "2 hours ago",
      days: 2,
      status: "Pending",
    },
    {
      id: "3",
      employee: "Piotr Wiśniewski",
      department: "Marketing",
      type: "Annual Leave",
      dates: "10 Sep 2026 - 15 Sep 2026",
      submitted: "3 days ago",
      days: 4,
      status: "Approved",
    },
    {
      id: "4",
      employee: "Katarzyna Wójcik",
      department: "HR",
      type: "Unpaid Leave",
      dates: "05 Oct 2026 - 06 Oct 2026",
      submitted: "1 day ago",
      days: 2,
      status: "Rejected",
    },
  ]);

  const filteredRequests = requests.filter((req) => {
    if (statusFilter === "All") return true;
    return req.status === statusFilter;
  });

  return (
    <Stack gap="lg">
      <Title order={2}>Team Leave Requests</Title>

      <Flex direction={{ base: "column", lg: "row" }} gap="md">
        <Box style={{ flex: 1 }}>
          <Paper p="lg" radius="md" withBorder>
            <Group justify="space-between" mb="md" align="center">
              <Box>
                <Title order={3} size="h4">
                  All Pending Leave Requests
                </Title>
                <Text size="sm" c="dimmed">
                  Review and override company-wide time off requests
                </Text>
              </Box>
              <Button
                component={Link}
                href="/team/leave-requests/new"
                variant="subtle"
                size="xs"
                rightSection={<IconChevronRight size={14} />}
              >
                Add New
              </Button>
            </Group>

            <Group mb="lg">
              <SegmentedControl
                value={statusFilter}
                onChange={setStatusFilter}
                data={[
                  { label: "Pending", value: "Pending" },
                  { label: "Approved", value: "Approved" },
                  { label: "Rejected", value: "Rejected" },
                  { label: "All", value: "All" },
                ]}
                radius="xl"
                color="blue"
              />
            </Group>

            <Table.ScrollContainer minWidth={600}>
              <Table verticalSpacing="sm" highlightOnHover>
                <Table.Thead>
                  <Table.Tr>
                    <Table.Th>Employee</Table.Th>
                    <Table.Th>Type</Table.Th>
                    <Table.Th>Dates</Table.Th>
                    <Table.Th>Days</Table.Th>
                    <Table.Th>Status</Table.Th>
                    <Table.Th>Actions</Table.Th>
                  </Table.Tr>
                </Table.Thead>
                <Table.Tbody>
                  {filteredRequests.map((req) => (
                    <Table.Tr key={req.id}>
                      <Table.Td>
                        <Group gap="sm" wrap="nowrap">
                          <Avatar src={req.avatar} radius="xl" size="sm" />
                          <Box>
                            <Text size="sm" fw={500}>
                              {req.employee}
                            </Text>
                            <Text size="xs" c="dimmed">
                              {req.department}
                            </Text>
                          </Box>
                        </Group>
                      </Table.Td>
                      <Table.Td>
                        <Badge variant="light" color="blue" size="sm">
                          {req.type}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm">{req.dates}</Text>
                        <Text size="xs" c="dimmed">
                          Submitted {req.submitted}
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Text size="sm" fw={500}>
                          {req.days}d
                        </Text>
                      </Table.Td>
                      <Table.Td>
                        <Badge
                          variant="dot"
                          color={
                            req.status === "Approved"
                              ? "green"
                              : req.status === "Rejected"
                                ? "red"
                                : "yellow"
                          }
                          size="sm"
                        >
                          {req.status}
                        </Badge>
                      </Table.Td>
                      <Table.Td>
                        <Group gap={4} wrap="nowrap">
                          <Tooltip label="Approve">
                            <ActionIcon variant="light" color="green" radius="xl">
                              <IconCheck size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Tooltip label="Reject">
                            <ActionIcon variant="light" color="red" radius="xl">
                              <IconX size={16} />
                            </ActionIcon>
                          </Tooltip>
                          <Menu position="bottom-end" shadow="md">
                            <Menu.Target>
                              <ActionIcon variant="subtle" color="gray" radius="xl">
                                <IconDotsVertical size={16} />
                              </ActionIcon>
                            </Menu.Target>
                            <Menu.Dropdown>
                              <Menu.Item>View Details</Menu.Item>
                              <Menu.Item color="blue">Adjust Balance</Menu.Item>
                            </Menu.Dropdown>
                          </Menu>
                        </Group>
                      </Table.Td>
                    </Table.Tr>
                  ))}
                </Table.Tbody>
              </Table>
            </Table.ScrollContainer>
          </Paper>
        </Box>
      </Flex>
    </Stack>
  );
}