import { Container } from "@mantine/core";
import DepartmentsTable from "./_components/DepartmentsTable";
import { getDepartments } from "@/actions/departmentsActions";

export default async function DepartmentsPage() {
  const { data: departments } = await getDepartments();

  return (
    <Container size="xl" py="lg">
      <DepartmentsTable departments={departments} />
    </Container>
  );
}
