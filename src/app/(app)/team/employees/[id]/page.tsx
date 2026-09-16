import { redirect } from "next/navigation";

export default async function EmployeeDetailIndex({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  redirect(`/team/employees/${id}/profile`);
}
