"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";

dayjs.extend(isSameOrBefore);

async function getBankHolidays(year: number): Promise<string[]> {
  try {
    const res = await fetch("https://gov.uk/bank-holidays.json");
    const data = await res.json();
    const englandHolidays = data["england-and-wales"].events;
    return englandHolidays.map((event: { date: string }) => event.date);
  } catch (error) {
    return [];
  }
}


export async function getTeamLeaveRequests() {
  try {
    await connectDB();
    const orgId = await getOrganizationId();

    if (!orgId) {
      return { success: false, error: "Organization ID is missing" };
    }

    const leaveRequests = await LeaveRequest.find({ organizationId: orgId })
      .populate("employee", "firstName lastName email department")
      .sort({ createdAt: -1 })
      .lean();

    return {
      success: true,
      data: JSON.parse(JSON.stringify(leaveRequests)),
    };
  } catch (error: unknown) {
    console.error("Error fetching team leave requests:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to fetch leave requests",
    };
  }
}


interface CreateLeaveRequestInput {
  employee: string;
  startDate: string; // Format "YYYY-MM-DD"
  endDate: string;   // Format "YYYY-MM-DD"
}

export async function createLeaveRequest(data: CreateLeaveRequestInput) {
  await connectDB();

  const { employee, startDate, endDate } = data;

  const start = dayjs(startDate, "YYYY-MM-DD");
  const end = dayjs(endDate, "YYYY-MM-DD");

  if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
    return { error: "Invalid date range" };
  }

  const bankHolidays = await getBankHolidays(start.year());

  const datesToRequest: string[] = [];
  let current = start;

  while (current.isSameOrBefore(end, "day")) {
    const dayOfWeek = current.day();
    const formattedDate = current.format("YYYY-MM-DD");

    const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
    const isBankHoliday = bankHolidays.includes(formattedDate);

    if (!isWeekend && !isBankHoliday) {
      datesToRequest.push(formattedDate);
    }

    current = current.add(1, "day");
  }

  if (datesToRequest.length === 0) {
    return { error: "Selected range contains no working days" };
  }

  const organizationId = await getOrganizationId();

  const existingConflict = await LeaveRequest.findOne({
    employee,
    status: { $in: ["pending", "approved"] },
    dates: { $in: datesToRequest },
    organizationId,
  });

  if (existingConflict) {
    return { error: "Selected dates overlap with an existing request" };
  }

  const newRequest = await LeaveRequest.create({
    employee,
    dates: datesToRequest,
    daysRequested: datesToRequest.length,
    status: "pending",
    organizationId,
  });

  return { success: true, requestId: newRequest._id.toString() };
}

// export async function createLeaveRequestAsEmployee(data: EmployeeLeaveRequestParams) {
//   try {
//     await connectDB();
//     const currentUser = await getSessionUser();

//     if (!currentUser) {
//       return { success: false, error: "Unauthorized" };
//     }

//     const organizationId = await getOrganizationId();
//     const dates = generateDatesArray(data.startDate, data.endDate);

//     if (dates.length === 0) {
//       return { success: false, error: "Please select valid dates" };
//     }

//     const newLeaveRequest = await LeaveRequest.create({
//       user: currentUser.id,
//       organization: organizationId,
//       dates,
//       daysRequested: dates.length,
//       status: "pending",
//     });

//     revalidatePath("/me/leave-requests");

//     return {
//       success: true,
//       data: JSON.parse(JSON.stringify(newLeaveRequest)),
//       error: null,
//     };
//   } catch (error: unknown) {
//     console.error("Error creating leave request as employee:", error);
//     return {
//       success: false,
//       error: error instanceof Error ? error.message : "Failed to create leave request",
//     };
//   }
// }

interface CreateLeaveRequestAsAdminParams {
  userId: string;
  startDate: string;
  endDate: string;
}

function generateDatesArray(startDate: string, endDate: string): Date[] {
  const dates: Date[] = [];
  const current = new Date(startDate);
  const end = new Date(endDate);

  while (current <= end) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

export async function createLeaveRequestAsAdmin(data: CreateLeaveRequestAsAdminParams) {
  try {
    await connectDB();

    if (!data.userId) {
      return { success: false, error: "Please select an employee" };
    }

    if (!data.startDate || !data.endDate) {
      return { success: false, error: "Please select start and end dates" };
    }

    const orgId = await getOrganizationId();

    if (!orgId) {
      return { success: false, error: "Organization ID is missing or undefined" };
    }

    const dates = generateDatesArray(data.startDate, data.endDate);

    if (dates.length === 0) {
      return { success: false, error: "Invalid date range selected" };
    }

    const newLeaveRequest = await LeaveRequest.create({
      employee: data.userId,
      organizationId: orgId,
      dates,
      daysRequested: dates.length,
      status: "approved",
    });

    revalidatePath("/team/leave-requests");

    return {
      success: true,
      data: JSON.parse(JSON.stringify(newLeaveRequest)),
      error: null,
    };
  } catch (error: unknown) {
    console.error("Error creating leave request as admin:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to create leave request",
    };
  }
}