"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import type { MyLeaveRequestDetail } from "@/types/leaveRequest";

export async function getMyLeaveRequests() {
    try {
        await connectDB();
        const employeeId = await getCurrentEmployeeId();

        const leaveRequests = await LeaveRequest.find({ employee: employeeId })
            .sort({ createdAt: -1 })
            .lean();

        return {
            success: true,
            data: JSON.parse(JSON.stringify(leaveRequests)) as MyLeaveRequestDetail[],
        };
    } catch (error: unknown) {
        console.error("Error fetching my leave requests:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch leave requests",
        };
    }
}