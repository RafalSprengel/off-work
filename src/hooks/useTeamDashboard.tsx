"use client";

import {
    getTeamDashboard,
    type TeamDashboardData,
} from "@/actions/manager/leave/getTeamDashboard";
import { notifications } from "@mantine/notifications";
import { IconX } from "@tabler/icons-react";
import { useEffect, useState } from "react";

export function useTeamDashboard() {
    const [data, setData] = useState<TeamDashboardData | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchDashboard() {
            setLoading(true);
            const res = await getTeamDashboard();
            if (res.success && res.data) {
                setData(res.data);
            } else {
                notifications.show({
                    title: "Error",
                    message: res.error || "Failed to load dashboard data",
                    color: "red",
                    icon: <IconX size={16} />,
                });
            }
            setLoading(false);
        }

        fetchDashboard();
    }, []);

    return { data, loading };
}