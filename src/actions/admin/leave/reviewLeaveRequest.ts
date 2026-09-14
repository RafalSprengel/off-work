"use server";

import mongoose from "mongoose";
import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import Employee from "@/db/models/Employee";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import { revalidatePath } from "next/cache";

async function getCurrentEmployee() {
    const employeeId = await getCurrentEmployeeId();
    const employee = await Employee.findById(employeeId).lean();
    return {
        id: employeeId,
        name: employee ? `${employee.firstName} ${employee.lastName}` : "",
    };
}

export async function approveLeaveRequestAsAdmin(id: string) {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, error: "Leave request not found." };
        }

        const organizationId = await getOrganizationId();
        const { id: reviewerId, name: reviewerName } = await getCurrentEmployee();

        const request = await LeaveRequest.findOne({ _id: id, organizationId });

        if (!request) {
            return { success: false, error: "Leave request not found." };
        }

        if (request.status === "cancelled") {
            return { success: false, error: "Cannot approve a cancelled leave request." };
        }

        if (request.status === "approved") {
            return { success: false, error: "Leave request is already approved." };
        }

        request.status = "approved";
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        request.reviewedByName = reviewerName;
        request.rejectionReason = null;
        await request.save();

        revalidatePath("/team/leave-requests");
        revalidatePath("/me/leave-requests");
        revalidatePath(`/team/leave-requests/${id}`);
        revalidatePath(`/me/leave-requests/${id}`);

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error approving leave request as admin:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to approve leave request",
        };
    }
}

export async function rejectLeaveRequestAsAdmin(id: string, rejectionReason?: string) {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, error: "Leave request not found." };
        }

        const organizationId = await getOrganizationId();
        const { id: reviewerId, name: reviewerName } = await getCurrentEmployee();

        const request = await LeaveRequest.findOne({ _id: id, organizationId });

        if (!request) {
            return { success: false, error: "Leave request not found." };
        }

        if (request.status === "cancelled") {
            return { success: false, error: "Cannot reject a cancelled leave request." };
        }

        if (request.status === "rejected") {
            return { success: false, error: "Leave request is already rejected." };
        }

        request.status = "rejected";
        request.reviewedBy = reviewerId;
        request.reviewedAt = new Date();
        request.reviewedByName = reviewerName;
        request.rejectionReason = rejectionReason?.trim() || null;
        await request.save();

        revalidatePath("/team/leave-requests");
        revalidatePath("/me/leave-requests");
        revalidatePath(`/team/leave-requests/${id}`);
        revalidatePath(`/me/leave-requests/${id}`);

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error rejecting leave request as admin:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to reject leave request",
        };
    }
}