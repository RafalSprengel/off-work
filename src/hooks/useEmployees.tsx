"use client";

import { getEmployees } from "@/actions/employeesActions";
import type { IEmployee } from "@/types/employees";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useEmployees() {
    const [employees, setEmployees] = useState<IEmployee[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchEmployees() {
            setLoading(true);
            const res = await getEmployees();
            if (res.success && res.data) {
                setEmployees(res.data);
            } else {
                notifications.show({
                    title: "Error",
                    message: res.error || "Failed to load employees",
                    color: "red",
                    icon: <IconX size={ 16} />,
        });
}
setLoading(false);
    }

fetchEmployees();
  }, []);

return { employees, loading };
}