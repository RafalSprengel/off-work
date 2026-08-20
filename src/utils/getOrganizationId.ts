import { getAuth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getOrganizationId(): Promise<string> {
    const auth = await getAuth();

    const session = await auth.api.getSession({
        headers: await headers(),
    });

    const organizationId = session?.session?.activeOrganizationId;

    if (!organizationId) {
        throw new Error("Unauthorized: Missing tenant/organization context");
    }

    return organizationId;
}