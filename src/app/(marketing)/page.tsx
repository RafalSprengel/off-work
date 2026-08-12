import {
  Button,
  Center,
  Container,
  Flex,
  Group,
  Stack,
  Title,
  Text
} from "@mantine/core";
import styles from "./page.module.css";
import Link from "next/link";

export default function Home() {
  return (
    <Container size="xs" px="md">
      <Flex
        direction="column"
        align="center"
        justify="center"
        mih="100svh"
        gap="xl"
      >
        <Stack gap="0" align="center" w="100%" pb="md" >
          <Title
            order={1}
            // fw={900}
            fw={{ base: "600", sm: "700" }}
            fz={{ base: "4rem", sm: "4.5rem" }}
            m={0}
            className={styles.heroTitle}
          >
            Off-Work
          </Title>
          <Center>
            <Text
              fz={{ base: '1rem', sm: '1.5rem' }}
              fw={500}
              ta="center"
              c="light-dark(var(--mantine-color-gray-6), var(--mantine-color-gray-4))"
            >
              Leave Management System
            </Text>
          </Center>
        </Stack>

        <Group gap="md"
          mb={{ base: '12svh', sm: 'xl' }}
          grow
          className={styles.buttonGroup}>
          <Button
            variant="filled"
            size="lg"
            radius="md"
            className={styles.homeButton}
          >
            Register
          </Button>
          <Button
            variant="light"
            size="lg"
            radius="md"
            className={styles.homeButton}
            component="a"
            href="/dashboard"
          >
            Login
          </Button>
        </Group>
      </Flex>
    </Container>
  );
}
