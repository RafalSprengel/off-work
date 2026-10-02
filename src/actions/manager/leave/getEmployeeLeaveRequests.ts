"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import type { TeamLeaveRequestItem } from "@/types/leaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { addChargedDays } from "@/utils/enrichLeaveRequests";

export async function getEmployeeLeaveRequests(
  employeeId: string,
): Promise<{ success: boolean; data: TeamLeaveRequestItem[]; error?: string }> {
  try {
    await connectDB();
    const orgId = await getOrganizationId();

    if (!orgId) {
      return { success: false, data: [], error: "Organization ID is missing" };
    }

    const leaveRequests = await LeaveRequest.find({
      organizationId: orgId,
      employee: employeeId,
    })
      .sort({ createdAt: -1 })
      .lean();

    const parsed = JSON.parse(
      JSON.stringify(leaveRequests),
    ) as TeamLeaveRequestItem[];

    return {
      success: true,
      data: await addChargedDays(parsed, orgId),
    };
  } catch (error: unknown) {
    console.error("Error fetching employee leave requests:", error);
    return {
      success: false,
      data: [],
      error:
        error instanceof Error
          ? error.message
          : "Failed to fetch leave requests",
    };
  }
}
