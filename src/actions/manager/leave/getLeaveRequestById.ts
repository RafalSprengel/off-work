"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import Employee from "@/db/models/Employee";
import { getOrganizationId } from "@/utils/getOrganizationId";
import type { LeaveRequestDetail } from "@/types/leaveRequest";

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

        const data = JSON.parse(JSON.stringify(leaveRequest)) as LeaveRequestDetail;

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
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch leave request",
        };
    }
}