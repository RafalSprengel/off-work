'use client';
import { useState } from "react";
import {
  Title,
  Button,
  Group,
  Paper,
  Table,
  Text,
  Badge,
  ActionIcon,
  Container,
  Stack,
  Modal,
  TextInput,
} from '@mantine/core';
import { IconPlus, IconEdit, IconTrash } from '@tabler/icons-react';
import Link from 'next/link';
import ModalContent from './ModalContent';

interface Department {
  id: string;
  name: string;
  manager: string;
  employeesCount: number;
}

const mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Software Engineering',
    manager: 'John Doe',
    employeesCount: 14,
  },
  {
    id: '2',
    name: 'Human Resources',
    manager: 'Jane Smith',
    employeesCount: 5,
  },
  {
    id: '3',
    name: 'Marketing & Sales',
    manager: 'Alex Johnson',
    employeesCount: 8,
  },
  {
    id: '4',
    name: 'Finance & Accounting',
    manager: 'Robert Brown',
    employeesCount: 4,
  },
];

export default function DepartmentsPage() {
  const [opened, setOpened] = useState(false);
  const close = () => setOpened(false);
  const open = () => setOpened(true);

  const rows = mockDepartments.map((dept) => (
    <Table.Tr key={dept.id}>
      <Table.Td>
        <Text fw={500} size="sm">{dept.name}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{dept.manager}</Text>
      </Table.Td>
      <Table.Td>
        <Text size="sm">{dept.employeesCount}</Text>
      </Table.Td>
      <Table.Td>
        <Group gap={4} justify="flex-end" wrap="nowrap">
          <Link href={`/departments/${dept.id}/edit`}>
            <ActionIcon
              variant="subtle"
              color="blue"
              aria-label="Edit department"
              size="sm"
            >
              <IconEdit size={16} />
            </ActionIcon>
          </Link>
          <ActionIcon
            variant="subtle"
            color="red"
            aria-label="Delete department"
            size="sm"
          >
            <IconTrash size={16} />
          </ActionIcon>
        </Group>
      </Table.Td>
    </Table.Tr>
  ));

  return (<>
    <Container size="xl" py="lg">
      <Stack gap="lg">
        {/* NAGŁÓWEK */}
        <Group justify="space-between" align="flex-start">
          <div>
            <Title order={2} fw={700}>
              Departments
            </Title>
            <Badge variant="light" color="blue" size="md" mt="xs">
              {mockDepartments.length} DEPARTMENTS
            </Badge>
          </div>

          <Button
            color="green"
            leftSection={<IconPlus size={16} />}
            onClick={open}
          >
            New
          </Button>
        </Group>

        {/* TABELA */}
        <Paper withBorder shadow="xs" radius="md">
          <Table.ScrollContainer minWidth={500}>
            <Table verticalSpacing="sm" horizontalSpacing="md">
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Name</Table.Th>
                  <Table.Th>Manager</Table.Th>
                  <Table.Th>Employees</Table.Th>
                  <Table.Th style={{ textAlign: 'right' }}>Actions</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>{rows}</Table.Tbody>
            </Table>
          </Table.ScrollContainer>
        </Paper>
      </Stack>
    </Container>
    <Modal opened={opened} onClose={close} title="Add a new department" centered>
      <ModalContent />
    </Modal>

  </>
  );
}