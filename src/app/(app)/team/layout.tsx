import { redirect } from "next/navigation";
import { getCurrentEmployeeRole } from "@/actions/shared/getCurrentEmployeeRole";

export default async function TeamLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { success, role } = await getCurrentEmployeeRole();

    if (!success || role === "Employee") {
        redirect("/me");
    }

    return <>{ children } </>;
}