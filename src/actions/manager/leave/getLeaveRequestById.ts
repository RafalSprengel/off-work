"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";

export interface LeaveRequestDetail {
    _id: string;
    employee: {
        _id: string;
        firstName: string;
        lastName: string;
        email: string;
        department?: { _id: string; name: string };
        managerId?: { _id: string; firstName: string; lastName: string } | null;
    };
    startDate: string;
    endDate: string;
    startHalfDay: boolean;
    endHalfDay: boolean;
    daysRequested: number;
    status: "pending" | "approved" | "rejected" | "cancelled";
    type: "annual" | "sick" | "unpaid" | "other";
    comment?: string;
    rejectionReason?: string | null;
    createdBy?: {
        _id: string;
        firstName: string;
        lastName: string;
    } | null;
    approvedBy?: {
        _id: string;
        firstName: string;
        lastName: string;
    } | null;
    approvedAt?: string | null;
    cancelledAt?: string | null;
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
        })
            .populate({
                path: "employee",
                select: "firstName lastName email department managerId",
                populate: [
                    { path: "department", select: "name" },
                    { path: "managerId", select: "firstName lastName" },
                ],
            })
            .populate({
                path: "createdBy",
                select: "firstName lastName",
            })
            .populate({
                path: "approvedBy",
                select: "firstName lastName",
            })
            .lean();

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