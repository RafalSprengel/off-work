"use client";

import { getTeamLeaveRequests } from "@/actions/manager/leave/getTeamLeaveRequests";
import type { TeamLeaveRequestItem } from "@/types/leaveRequest";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useTeamLeaveRequests() {
    const [requests, setRequests] = useState<TeamLeaveRequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchRequests = async () => {
        const res = await getTeamLeaveRequests();
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
    };

    useEffect(() => {
        setLoading(true);
        fetchRequests().finally(() => setLoading(false));
    }, []);

    const refetch = async () => {
        await fetchRequests();
    };

    return { requests, loading, refetch };
}