"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";

export interface MyLeaveRequestDetail {
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
    daysRequested: number;
    status: "pending" | "approved" | "rejected";
    type: "annual" | "sick" | "unpaid" | "other";
    comment?: string;
    createdAt: string;
    updatedAt: string;
}

export async function getMyLeaveRequestById(id: string) {
    try {
        await connectDB();
        const employeeId = await getCurrentEmployeeId();

        const leaveRequest = await LeaveRequest.findOne({
            _id: id,
            employee: employeeId, // pracownik widzi tylko własne wnioski
        })
            .populate({
                path: "employee",
                select: "firstName lastName email department managerId",
                populate: [
                    { path: "department", select: "name" },
                    { path: "managerId", select: "firstName lastName" },
                ],
            })
            .lean();

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