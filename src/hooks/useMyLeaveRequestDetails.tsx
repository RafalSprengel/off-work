"use client";

import {
    getMyLeaveRequestById,
    type MyLeaveRequestDetail,
} from "@/actions/employee/leave/getMyLeaveRequestById";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useMyLeaveRequestDetails(id: string) {
    const [request, setRequest] = useState<MyLeaveRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRequest() {
            setLoading(true);
            const res = await getMyLeaveRequestById(id);
            if (res.success && res.data) {
                setRequest(res.data);
            } else {
                setError(res.error || "Failed to load leave request");
                notifications.show({
                    title: "Error",
                    message: res.error || "Failed to load leave request",
                    color: "red",
                    icon: <IconX size={16} />,
                });
            }
            setLoading(false);
        }

        if (id) fetchRequest();
    }, [id]);

    return { request, loading, error };
}