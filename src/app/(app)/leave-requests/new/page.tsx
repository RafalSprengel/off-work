"use client";

import { createLeaveRequest } from "@/actions/leaveRequestActions";
import {
  Button,
  Container,
  Divider,
  Flex,
  Paper,
  Select,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { DateInput } from "@mantine/dates";
import { useForm } from "@mantine/form";
import { IconCalendar } from "@tabler/icons-react";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";
import "@mantine/dates/styles.css";

const usersData = [
  {
    _id: "60d5ecb8b5c9c22b1c8e28a1",
    label: "Adam Pietrzak",
    department: "Kitchen",
    email: "adam@demo.com",
  },
  {
    _id: "60d5ecb8b5c9c22b1c8e28a2",
    label: "Artur Pawlak",
    department: "Floor",
    email: "artur@demo.com",
  },
];

export default function NewLeaveRequestPage() {
  const router = useRouter();

  const form = useForm({
    initialValues: {
      employee: "",
      startDate: null as Date | null,
      endDate: null as Date | null,
      completedDate: new Date(),
    },
    validate: {
      employee: (value) => (!value ? "Please select an employee" : null),
      startDate: (value) => (!value ? "Start date is required" : null),
      endDate: (value) => (!value ? "End date is required" : null),
    },
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!values.startDate || !values.endDate) return;

    const result = await createLeaveRequest({
      user: values.employee,
      startDate: dayjs(values.startDate).format("YYYY-MM-DD"),
      endDate: dayjs(values.endDate).format("YYYY-MM-DD"),
    });

    if (result.error) {
      form.setErrors({ startDate: result.error });
    } else {
      router.push("/leave-requests");
    }
  };

  const selectData = usersData.map((u) => ({
    value: u._id,
    label: u.label,
  }));

  return (
    <Container size="sm" py="lg" px={{ base: "xs", sm: "md" }}>
      <Stack gap="lg">
        <Title order={2}>Create new request</Title>
        <Paper p={{ base: "md", sm: "xl" }} radius="md" withBorder>
          <form onSubmit={form.onSubmit(handleSubmit)}>
            <Stack gap="md">
              <Select
                label="Employee"
                placeholder="Select employee"
                data={selectData}
                searchable
                nothingFoundMessage="Nothing found..."
                {...form.getInputProps("employee")}
                renderOption={({ option }) => {
                  const user = usersData.find((u) => u._id === option.value);
                  return (
                    <div>
                      <Text size="sm" fw={600}>
                        {user?.label}
                      </Text>
                      <Text size="xs" c="dimmed">
                        🏢 {user?.department}
                      </Text>
                      <Text size="xs" c="dimmed">
                        ✉️ {user?.email}
                      </Text>
                    </div>
                  );
                }}
              />

              <Flex direction={{ base: "column", sm: "row" }} gap="md">
                <DateInput
                  label="1st Day of Holiday"
                  placeholder="Select start date"
                  leftSection={<IconCalendar size={18} />}
                  valueFormat="YYYY-MM-DD"
                  {...form.getInputProps("startDate")}
                  clearable
                  style={{ flex: 1 }}
                />

                <DateInput
                  label="Last Day of Holiday"
                  placeholder="Select end date"
                  leftSection={<IconCalendar size={18} />}
                  valueFormat="YYYY-MM-DD"
                  minDate={form.values.startDate || undefined}
                  {...form.getInputProps("endDate")}
                  clearable
                  style={{ flex: 1 }}
                />
              </Flex>

              <Divider my="xs" />

              <Flex
                direction={{ base: "column", xs: "row" }}
                justify="space-between"
                align={{ base: "flex-start", sm: "center" }}
                gap="sm"
              >
                <div>
                  <Text size="xs" c="dimmed" tt="uppercase" fw={700}>
                    Date Completed
                  </Text>
                  <Flex gap={6} align="center">
                    <IconCalendar size={16} style={{ opacity: 0.7 }} />
                    <Text size="sm" fw={500}>
                      {dayjs(form.values.completedDate).format("YYYY-MM-DD")}
                    </Text>
                  </Flex>
                </div>
              </Flex>

              <Flex justify="flex-end" mt="md">
                <Button
                  type="submit"
                  color="blue"
                  w={{ base: "100%", sm: "auto" }}
                >
                  Submit Request
                </Button>
              </Flex>
            </Stack>
          </form>
        </Paper>
      </Stack>
    </Container>
  );
}