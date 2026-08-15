import { useEffect, useState } from "react";
import { getManagers } from "@/actions/manager/employees/getManagers";
import type { IManager } from "@/types/employees";
import { notifications } from "@mantine/notifications"
import { IconX } from "@tabler/icons-react"


export function useManagers() {

    const [data, setManagers] = useState<IManager[]>([])
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        async function loadManagers() {
            setIsLoading(true)
            const { success, data: res, error } = await getManagers();
            if (success && res) setManagers(res)
            else {

                notifications.show({
                    title: "Error",
                    message: error || "Failed to load managers",
                    color: "red",
                    icon: <IconX />
                })
            };
            setIsLoading(false)
        };
        loadManagers()
    }, [])
    return { data, isLoading, error }
}