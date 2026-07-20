import { Button, Container, Flex, Group, Stack, Center, Title } from "@mantine/core";
import styles from "./page.module.css";

export default function Home() {
  return (
    <Container size="xs" px="md">
      <Flex
        direction="column"
        align="center"
        justify="center"
        mih="100vh"
        gap="xl"
      >
        <Stack gap="0" align="center" w="100%" pb='md'>
          <Title
            order={1}
            // fw={900}
            fw={{ base: '600', sm: '700' }}
            fz={{ base: '4rem', sm: '4.5rem' }}
            m={0}
            className={styles.heroTitle}
          >
            Off-Work
          </Title>
          <Center
            c="var(--mantine-color-blue-6)"
          >
            Leave Management System
          </Center>
        </Stack>

        <Group gap="md" grow className={styles.buttonGroup}>
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
          >
            Login
          </Button>
        </Group>
      </Flex>
    </Container>
  );
}