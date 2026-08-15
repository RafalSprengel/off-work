"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";

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