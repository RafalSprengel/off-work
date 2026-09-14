"use client";

import { getMyLeaveRequests } from "@/actions/employee/leave/getMyLeaveRequests";
import type { MyLeaveRequestDetail } from "@/types/leaveRequest";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useMyLeaveRequests() {
    const [requests, setRequests] = useState<MyLeaveRequestDetail[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRequests() {
            setLoading(true);
            const res = await getMyLeaveRequests();
            if (res.success && res.data) {
                setRequests(res.data);
            } else {
                notifications.show({
                    title: "Error",
                    message: res.error || "Failed to load leave requests",
                    color: "red",
                    icon: <IconX size={16} />,
                });
            }
            setLoading(false);
        }

        fetchRequests();
    }, []);

    return { requests, loading };
}