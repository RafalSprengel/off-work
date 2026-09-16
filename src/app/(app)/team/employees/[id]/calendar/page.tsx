import { notFound } from "next/navigation";

import { getEmployeeById } from "@/actions/manager/employees/getEmployeeById";
import { getEmployeeLeaveRequests } from "@/actions/manager/leave/getEmployeeLeaveRequests";
import HolidaySchedule, { type EmployeeScheduleEvent } from "./HolidaySchedule";

export default async function EmployeeCalendarPage({
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

  // Zdarzenia = zatwierdzony urlop wypoczynkowy (annual leave) pracownika
  const events: EmployeeScheduleEvent[] = leavesSuccess
    ? data
        .filter((req) => req.status === "approved" && req.type === "annual")
        .map((req) => ({
          id: req._id,
          title: "Annual Leave",
          start: `${req.startDate} 00:00:00`,
          end: `${req.endDate} 23:59:59`,
        }))
    : [];

  return <HolidaySchedule events={events} />;
}
