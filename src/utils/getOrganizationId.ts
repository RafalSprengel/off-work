// import { auth } from "@/lib/auth";
import { headers } from "next/headers";

export async function getOrganizationId(): Promise<string> {

    const organizationId = "000000000000000000000001"; //tymczasowy hardkod

    // Przygotowanie do Better Auth:
    // const session = await auth.api.getSession({
    //     headers: await headers(),
    // });

    // const organizationId = session?.session?.activeOrganizationId;

    // if (!organizationId) {
    //     throw new Error("Unauthorized: Missing tenant/organization context");
    // }

    return organizationId;
}