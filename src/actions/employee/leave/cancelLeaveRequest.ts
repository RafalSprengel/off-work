"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";
import mongoose from "mongoose";

export async function cancelMyLeaveRequest(id: string) {
    try {
        await connectDB();
        const employeeId = await getCurrentEmployeeId();
        const organizationId = await getOrganizationId();

        const request = await LeaveRequest.findOne({
            _id: id,
            employee: new mongoose.Types.ObjectId(employeeId),
            organizationId,
        });

        if (!request) {
            return { success: false, error: "Leave request not found." };
        }

        if (request.status === "cancelled") {
            return { success: false, error: "Leave request is already cancelled." };
        }

        if (request.status === "rejected") {
            return { success: false, error: "Cannot cancel a rejected leave request." };
        }

        request.status = "cancelled";
        request.cancelledAt = new Date();
        await request.save();

        revalidatePath("/me/leave-requests");
        revalidatePath("/team/leave-requests");
        revalidatePath(`/me/leave-requests/${id}`);

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error cancelling leave request:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to cancel leave request",
        };
    }
}