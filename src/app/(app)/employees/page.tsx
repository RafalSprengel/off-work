import { Container } from "@mantine/core";
import EmployeeTable from "./_components/EmployeeTable";

export default function EmployeePage() {

    return (
        <Container size="xl" py="lg">
            <EmployeeTable />
        </Container>
    )
}