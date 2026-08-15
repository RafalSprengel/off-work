"use client";

import { getUkBankHolidays } from "@/actions/public/bankHolidays/getUkBankHolidays";
import { useEffect, useState } from "react";

export function useUkBankHolidays() {
    const [bankHolidays, setBankHolidays] = useState<string[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchHolidays() {
            setLoading(true);
            const res = await getUkBankHolidays();
            if (res.success && res.data) {
                setBankHolidays(res.data);
            }
            setLoading(false);
        }

        fetchHolidays();
    }, []);

    return { bankHolidays, loading };
}