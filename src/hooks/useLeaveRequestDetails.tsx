"use client";

import {
    getLeaveRequestById,
    type LeaveRequestDetail,
} from "@/actions/manager/leave/getLeaveRequestById";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useLeaveRequestDetails(id: string) {
    const [request, setRequest] = useState<LeaveRequestDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function fetchRequest() {
            setLoading(true);
            const res = await getLeaveRequestById(id);
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