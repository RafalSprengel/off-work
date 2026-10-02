"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import type { MyLeaveRequestDetail } from "@/types/leaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { addChargedDays } from "@/utils/enrichLeaveRequests";

export async function getMyLeaveRequests() {
    try {
        await connectDB();
        const employeeId = await getCurrentEmployeeId();
        const organizationId = await getOrganizationId();

        const leaveRequests = await LeaveRequest.find({ employee: employeeId })
            .sort({ createdAt: -1 })
            .lean();

        const parsed = JSON.parse(JSON.stringify(leaveRequests)) as MyLeaveRequestDetail[];

        return {
            success: true,
            data: await addChargedDays(parsed, organizationId),
        };
    } catch (error: unknown) {
        console.error("Error fetching my leave requests:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch leave requests",
        };
    }
}