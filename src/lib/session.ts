import { cache } from "react";
import { headers } from "next/headers";
import { getAuth } from "@/lib/auth";

export const getCachedSession = cache(async () => {
    const auth = await getAuth();
    return auth.api.getSession({ headers: await headers() });
});

export const getCachedFreshSession = cache(async () => {
    const auth = await getAuth();
    return auth.api.getSession({
        headers: await headers(),
        query: { disableCookieCache: true },
    });
});
