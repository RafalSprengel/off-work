"use client";

import { getCurrentEmployee } from "@/actions/shared/getCurrentEmployee";
import type { IEmployee } from "@/types/employees";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useCurrentEmployee() {
    const [employee, setEmployee] = useState<IEmployee | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEmployee() {
            setLoading(true);
            const res = await getCurrentEmployee();

            if (res.success && res.data) {
                setEmployee(res.data);
            } else {
                notifications.show({
                    title: "Error",
                    message: res.error || "Failed to load your profile",
                    color: "red",
                    icon: <IconX size={16} />,
                });
            }

            setLoading(false);
        }

        fetchEmployee();
    }, []);

    return { employee, loading };
}