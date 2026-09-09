"use client";

import { getRoles } from "@/actions/public/roles/getRoles";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useRoles() {
    const [roles, setRoles] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadRoles() {
            setLoading(true);
            const { success, data, error } = await getRoles();
            if (success) {
                setRoles(data);
            } else {
                notifications.show({
                    title: "Error",
                    message: error ?? "Failed to load roles",
                    color: "red",
                    icon: <IconX />
                });
            }
            setLoading(false);
        }
        loadRoles();
    }, []);

    return { roles, loading };
}