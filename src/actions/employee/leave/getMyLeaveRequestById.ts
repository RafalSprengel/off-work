"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import Employee from "@/db/models/Employee";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import type { MyLeaveRequestDetail } from "@/types/leaveRequest";
import mongoose from "mongoose";

export async function getMyLeaveRequestById(id: string) {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, error: "Leave request not found" };
        }

        const employeeId = await getCurrentEmployeeId();

        const leaveRequest = await LeaveRequest.findOne({
            _id: id,
            employee: employeeId,
        }).lean();

        if (!leaveRequest) {
            return { success: false, error: "Leave request not found" };
        }

        const data = JSON.parse(JSON.stringify(leaveRequest)) as MyLeaveRequestDetail;

        // Resolve reviewer name from the referenced employee if not persisted yet.
        if (!data.reviewedByName && leaveRequest.reviewedBy) {
            const reviewer = await Employee.findById(leaveRequest.reviewedBy)
                .select("firstName lastName")
                .lean();
            if (reviewer) {
                data.reviewedByName = `${reviewer.firstName} ${reviewer.lastName}`;
            }
        }

        return {
            success: true,
            data,
        };
    } catch (error: unknown) {
        console.error("Error fetching leave request:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to fetch leave request",
        };
    }
}