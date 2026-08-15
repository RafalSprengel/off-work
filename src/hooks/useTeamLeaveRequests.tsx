"use client";

import { getTeamLeaveRequests, type TeamLeaveRequestItem } from "@/actions/manager/leave/getTeamLeaveRequests";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useTeamLeaveRequests() {
    const [requests, setRequests] = useState<TeamLeaveRequestItem[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchRequests() {
            setLoading(true);
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
            setLoading(false);
        }

        fetchRequests();
    }, []);

    return { requests, loading };
}