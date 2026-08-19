"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";

export interface LeaveRequestDetail {
    _id: string;
    startDate: string;
    endDate: string;
    startHalfDay: boolean;
    endHalfDay: boolean;
    daysRequested: number;
    status: "pending" | "approved" | "rejected" | "cancelled";
    type: "annual" | "sick" | "unpaid" | "other";
    comment?: string;
    rejectionReason?: string | null;
    approvedAt?: string | null;
    cancelledAt?: string | null;
    snapshot: {
        employeeName: string;
        employeeEmail: string;
        departmentName: string;
        managerName?: string;
        approvedByName?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export async function getLeaveRequestById(id: string) {
    try {
        await connectDB();
        const orgId = await getOrganizationId();

        if (!orgId) {
            return { success: false, error: "Organization ID is missing" };
        }

        const leaveRequest = await LeaveRequest.findOne({
            _id: id,
            organizationId: orgId,
        }).lean();

        if (!leaveRequest) {
            return { success: false, error: "Leave request not found" };
        }

        return {
            success: true,
            data: JSON.parse(JSON.stringify(leaveRequest)) as LeaveRequestDetail,
        };
    } catch (error: unknown) {
        console.error("Error fetching leave request:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch leave request",
        };
    }
}