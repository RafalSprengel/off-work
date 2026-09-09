"use client";

import { getDepartments } from "@/actions/manager/employees/getDepartments";
import type { IDepartment } from "@/types/department";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useDepartments() {
    const [departments, setDepartments] = useState<IDepartment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadDepatments() {
            setLoading(true);
            const { success, data, error } = await getDepartments();
            if (success) {
                setDepartments(data);
            } else {
                notifications.show({
                    title: "Error",
                    message: error,
                    color: "red",
                    icon: <IconX />
                });
            }
            setLoading(false);
        }
        loadDepatments();
    }, []);

    return { departments, loading };
}