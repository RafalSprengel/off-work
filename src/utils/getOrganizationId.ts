import { getCachedSession } from "@/lib/session";

export async function getOrganizationId(): Promise<string> {
    const session = await getCachedSession();

    const organizationId = session?.session?.activeOrganizationId;

    if (!organizationId) {
        throw new Error("Unauthorized: Missing tenant/organization context");
    }

    return organizationId;
}