import { Center, Loader } from "@mantine/core";

export default function EmployeeDetailLoading() {
  return (
    <Center style={{ minHeight: 240 }}>
      <Loader size="md" />
    </Center>
  );
}
