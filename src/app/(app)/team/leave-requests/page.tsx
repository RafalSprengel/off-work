"use client";

import {
  ActionIcon,
  Avatar,
  Badge,
  Box,
  Button,
  Flex,
  Group,
  Loader,
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
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useTeamLeaveRequests } from "@/hooks/useTeamLeaveRequests";
import type { TeamLeaveRequestItem } from "@/actions/manager/leave/getTeamLeaveRequests";

type RequestWithSnapshot = TeamLeaveRequestItem & {
  snapshot: NonNullable<TeamLeaveRequestItem["snapshot"]>;
};

dayjs.extend(relativeTime);

const typeLabels: Record<string, string> = {
  annual: "Annual Leave",
  sick: "Sick Leave",
  unpaid: "Unpaid Leave",
  other: "Other",
};

function formatDateRange(startDate: string, endDate: string): string {
  const start = dayjs(startDate, "YYYY-MM-DD");
  const end = dayjs(endDate, "YYYY-MM-DD");
  return `${start.format("D MMM YYYY")} - ${end.format("D MMM YYYY")}`;
}

export default function TeamLeaveRequestsPage() {
  const router = useRouter();

  const { requests, loading } = useTeamLeaveRequests();

  const [statusFilter, setStatusFilter] = useState<string>("Pending");

  const filteredRequests = useMemo(() => {
    return requests.filter((req): req is RequestWithSnapshot => {
      if (statusFilter === "All") return true;
      return req.status === statusFilter.toLowerCase();
    });
  }, [requests, statusFilter]);

  const pendingCount = useMemo(
    () => requests.filter((r) => r.status === "pending").length,
    [requests],
  );

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
                  { label: `Pending (${pendingCount})`, value: "Pending" },
                  { label: "Approved", value: "Approved" },
                  { label: "Rejected", value: "Rejected" },
                  { label: "All", value: "All" },
                ]}
                radius="xl"
                color="blue"
              />
            </Group>

            {loading ? (
              <Flex justify="center" py="xl">
                <Loader />
              </Flex>
            ) : filteredRequests.length === 0 ? (
              <Text ta="center" py="xl" c="dimmed">
                No leave requests found
              </Text>
            ) : (
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
                      <Table.Tr
                        key={req._id}
                        onClick={() =>
                          router.push(`/team/leave-requests/${req._id}`)
                        }
                        style={{ cursor: "pointer" }}
                      >
                        <Table.Td>
                          <Group gap="sm" wrap="nowrap">
                            <Avatar
                              name={req.snapshot.employeeName}
                              radius="xl"
                              size="sm"
                              color="initials"
                            />
                            <Box>
                              <Text size="sm" fw={500}>
                                {req.snapshot.employeeName}
                              </Text>
                              <Text size="xs" c="dimmed">
                                {req.snapshot.departmentName ?? "No Department"}
                              </Text>
                            </Box>
                          </Group>
                        </Table.Td>
                        <Table.Td>
                          <Badge variant="light" color="blue" size="sm">
                            {typeLabels[req.type] ?? req.type}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm">
                            {formatDateRange(req.startDate, req.endDate)}
                          </Text>
                          <Text size="xs" c="dimmed">
                            Submitted {dayjs(req.createdAt).fromNow()}
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Text size="sm" fw={500}>
                            {req.daysRequested}d
                          </Text>
                        </Table.Td>
                        <Table.Td>
                          <Badge
                            variant="dot"
                            color={
                              req.status === "approved"
                                ? "green"
                                : req.status === "rejected"
                                  ? "red"
                                  : "yellow"
                            }
                            size="sm"
                          >
                            {req.status.charAt(0).toUpperCase() +
                              req.status.slice(1)}
                          </Badge>
                        </Table.Td>
                        <Table.Td>
                          <Group gap={4} wrap="nowrap">
                            {req.status === "pending" && (
                              <>
                                <Tooltip label="Approve">
                                  <ActionIcon
                                    variant="light"
                                    color="green"
                                    radius="xl"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <IconCheck size={16} />
                                  </ActionIcon>
                                </Tooltip>
                                <Tooltip label="Reject">
                                  <ActionIcon
                                    variant="light"
                                    color="red"
                                    radius="xl"
                                    onClick={(e) => e.stopPropagation()}
                                  >
                                    <IconX size={16} />
                                  </ActionIcon>
                                </Tooltip>
                              </>
                            )}
                            <Menu position="bottom-end" shadow="md">
                              <Menu.Target>
                                <ActionIcon
                                  variant="subtle"
                                  color="gray"
                                  radius="xl"
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  <IconDotsVertical size={16} />
                                </ActionIcon>
                              </Menu.Target>
                              <Menu.Dropdown>
                                <Menu.Item
                                  component={Link}
                                  href={`/team/leave-requests/${req._id}`}
                                >
                                  View Details
                                </Menu.Item>
                                <Menu.Item color="blue">
                                  Adjust Balance
                                </Menu.Item>
                              </Menu.Dropdown>
                            </Menu>
                          </Group>
                        </Table.Td>
                      </Table.Tr>
                    ))}
                  </Table.Tbody>
                </Table>
              </Table.ScrollContainer>
            )}
          </Paper>
        </Box>
      </Flex>
    </Stack>
  );
}
