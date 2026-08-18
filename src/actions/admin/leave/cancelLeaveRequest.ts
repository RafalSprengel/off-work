"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";

export async function cancelLeaveRequestAsAdmin(id: string) {
    try {
        await connectDB();
        const organizationId = await getOrganizationId();

        const request = await LeaveRequest.findOne({
            _id: id,
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

        revalidatePath("/team/leave-requests");
        revalidatePath("/me/leave-requests");
        revalidatePath(`/team/leave-requests/${id}`);

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error cancelling leave request as admin:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to cancel leave request",
        };
    }
}