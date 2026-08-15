import { Container } from "@mantine/core";
import { getEmployees } from "@/actions/manager/employees/getEmployees";
import EmployeeTable from "./_components/EmployeeTable";

export default async function EmployeePage() {

    const { data: employees } = await getEmployees();

    return (
        <Container size="xl" py="lg">
            <EmployeeTable employees={employees} />
        </Container>
    )
}