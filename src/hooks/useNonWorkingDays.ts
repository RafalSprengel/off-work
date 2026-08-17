"use client";

import { getClosureDays } from "@/actions/admin/closureDays/getClosureDays";
import { useEffect, useMemo, useState } from "react";

interface NonWorkingDay {
    date: string;
    title: string;
}

export function useNonWorkingDays() {
    const [bankHolidays, setBankHolidays] = useState<NonWorkingDay[]>([]);
    const [closures, setClosures] = useState<NonWorkingDay[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchData() {
            setLoading(true);
            const [bhRes, clRes] = await Promise.all([
                getClosureDays("bank_holiday"),
                getClosureDays("company_closure"),
            ]);

            if (bhRes.success) {
                setBankHolidays(
                    bhRes.data
                        .filter((h) => h.enabled)
                        .map((h) => ({ date: h.date, title: h.title }))
                );
            }

            if (clRes.success) {
                setClosures(
                    clRes.data
                        .filter((c) => c.enabled)
                        .map((c) => ({ date: c.date, title: c.title }))
                );
            }

            setLoading(false);
        }

        fetchData();
    }, []);

    const bankHolidaysMap = useMemo(() => {
        const map = new Map<string, string>();
        bankHolidays.forEach((h) => map.set(h.date, h.title));
        return map;
    }, [bankHolidays]);

    const closuresMap = useMemo(() => {
        const map = new Map<string, string>();
        closures.forEach((c) => map.set(c.date, c.title));
        return map;
    }, [closures]);
    return { bankHolidaysMap, closuresMap, loading };
}