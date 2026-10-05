import { notFound } from "next/navigation";

import { getEmployeeById } from "@/actions/manager/employees/getEmployeeById";
import { getEmployeeLeaveRequests } from "@/actions/manager/leave/getEmployeeLeaveRequests";
import { getLeaveAllowances } from "@/actions/admin/leaveAllowances/getLeaveAllowances";
import { sumAnnualDaysUsed } from "@/utils/leaveBalance";
import type { LeaveAllowanceType } from "@/db/models/LeaveAllowance";
import EmployeeAllowancesTable, {
  type AllowanceRow,
} from "./_components/EmployeeAllowancesTable";

// Leave types displayed as rows. Each row has a "Set" button that stores the
// allowance in the LeaveAllowance collection (one document per employee + type).
const LEAVE_TYPE_ROWS: { type: LeaveAllowanceType; label: string }[] = [
  { type: "annual", label: "Annual allowance" },
  { type: "unpaid", label: "Unpaid leave" },
  { type: "sick", label: "Sick" },
  { type: "bereavement", label: "Bereavement" },
];

export default async function EmployeeAllowancesPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const { success, data: employee } = await getEmployeeById(id);
  if (!success || !employee) {
    notFound();
  }

  const { success: leavesSuccess, data } = await getEmployeeLeaveRequests(id);
  const leaveRequests = leavesSuccess ? data : [];

  // Only approved annual leave counts as used allowance; days covered by an
  // absence (sick etc.) are not deducted.
  const usedDays = sumAnnualDaysUsed(leaveRequests);

  const { success: allowancesSuccess, data: allowances } =
    await getLeaveAllowances(id);
  const allowanceByType = new Map(
    (allowancesSuccess ? allowances : []).map((a) => [a.type, a.days]),
  );

  const rows: AllowanceRow[] = LEAVE_TYPE_ROWS.map((row) => ({
    ...row,
    // Annual falls back to the legacy employee.holidayAllowance when unset.
    days:
      allowanceByType.get(row.type) ??
      (row.type === "annual" ? employee.holidayAllowance : 0),
  }));

  return (
    <EmployeeAllowancesTable employeeId={id} rows={rows} usedDays={usedDays} />
  );
}
