"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import type { MyLeaveRequestDetail } from "@/types/leaveRequest";

export async function getMyLeaveRequestById(id: string) {
    try {
        await connectDB();
        const employeeId = await getCurrentEmployeeId();

        const leaveRequest = await LeaveRequest.findOne({
            _id: id,
            employee: employeeId,
        }).lean();

        if (!leaveRequest) {
            return { success: false, error: "Leave request not found" };
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(leaveRequest)) as MyLeaveRequestDetail,
        };
    } catch (error: unknown) {
        console.error("Error fetching leave request:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch leave request",
        };
    }
}