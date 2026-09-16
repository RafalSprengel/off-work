import { Badge, Card, Group, SimpleGrid, Stack, Text } from "@mantine/core";
import { notFound } from "next/navigation";

import { getEmployeeById } from "@/actions/manager/employees/getEmployeeById";

const statusLabels: Record<string, string> = {
  active: "Active",
  invited: "Invited",
  inactive: "Inactive",
};

const statusColors: Record<string, string> = {
  active: "green",
  invited: "blue",
  inactive: "gray",
};

function InfoItem({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <Stack gap={2}>
      <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
        {label}
      </Text>
      <Text size="sm" fw={500}>
        {value}
      </Text>
    </Stack>
  );
}

export default async function EmployeeProfilePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { success, data: employee } = await getEmployeeById(id);
  if (!success || !employee) {
    notFound();
  }

  const department =
    typeof employee.department === "object"
      ? (employee.department?.name ?? "—")
      : (employee.department ?? "—");

  const employmentDate = employee.employmentDate
    ? new Date(employee.employmentDate).toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      })
    : "—";

  return (
    <Stack gap="md">
      <Card withBorder radius="md" padding="lg">
        <Stack gap="md">
          <Group
            justify="space-between"
            align="flex-start"
            wrap="wrap"
            gap="xs"
          >
            <Text fw={600} size="lg">
              {employee.firstName} {employee.lastName}
            </Text>
            <Badge
              variant="light"
              color={statusColors[employee.status] ?? "gray"}
            >
              {statusLabels[employee.status] ?? employee.status}
            </Badge>
          </Group>

          <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
            <InfoItem label="Email" value={employee.email} />
            <InfoItem label="Department" value={department} />
            <InfoItem label="Role" value={employee.role} />
            <InfoItem label="Manager" value={employee.managerName ?? "—"} />
            <InfoItem
              label="Holiday allowance"
              value={`${employee.holidayAllowance} days`}
            />
            <InfoItem label="Employment date" value={employmentDate} />
          </SimpleGrid>
        </Stack>
      </Card>
    </Stack>
  );
}
