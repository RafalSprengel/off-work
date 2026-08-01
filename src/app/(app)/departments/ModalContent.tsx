import { useState } from "react";
import {
    Button,
    Group,
    TextInput,
} from '@mantine/core';

export default function ModalContent() {
    return (
        <>

            <  TextInput label='Department name' placeholder='e.g. Fabrication'  />
            <Group grow mt='md'>
                <Button onClick={close} variant='light'>Close</Button>
                <Button onClick={close}>Save</Button>
            </Group>
        </>
    );
}