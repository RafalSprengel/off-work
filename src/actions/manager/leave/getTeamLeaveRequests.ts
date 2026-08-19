"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";

export interface TeamLeaveRequestItem {
    _id: string;
    startDate: string;
    endDate: string;
    startHalfDay: boolean;
    endHalfDay: boolean;
    daysRequested: number;
    status: "pending" | "approved" | "rejected";
    type: "annual" | "sick" | "unpaid" | "other";
    snapshot: {
        employeeName: string;
        employeeEmail: string;
        departmentName: string;
    };
    createdAt: string;
    updatedAt: string;
}

export async function getTeamLeaveRequests() {
    try {
        await connectDB();
        const orgId = await getOrganizationId();

        if (!orgId) {
            return { success: false, error: "Organization ID is missing" };
        }

        const leaveRequests = await LeaveRequest.find({ organizationId: orgId })
            .sort({ createdAt: -1 })
            .lean();

        return {
            success: true,
            data: JSON.parse(JSON.stringify(leaveRequests)) as TeamLeaveRequestItem[],
        };
    } catch (error: unknown) {
        console.error("Error fetching team leave requests:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch leave requests",
        };
    }
}