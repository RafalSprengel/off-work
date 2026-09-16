import { Center, Loader } from "@mantine/core";

export default function SettingsLoading() {
  return (
    <Center style={{ minHeight: 240 }}>
      <Loader size="md" />
    </Center>
  );
}
