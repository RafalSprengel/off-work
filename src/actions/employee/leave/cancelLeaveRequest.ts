"use server";

import dayjs from "dayjs";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import connectDB from "@/db/connection";
import Employee from "@/db/models/Employee";
import LeaveRequest from "@/db/models/LeaveRequest";
import {
    buildLeaveRequestCancelledEmail,
    toLeaveRequestEmailData,
} from "@/lib/emails/leaveRequestEmails";
import { sendEmail } from "@/lib/sendEmail";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function cancelMyLeaveRequest(id: string) {
    try {
        await connectDB();

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return { success: false, error: "Leave request not found." };
        }

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

        if (dayjs(request.endDate).isBefore(dayjs(), "day")) {
            return {
                success: false,
                error: "Cannot cancel a leave request that has already ended.",
            };
        }

        request.status = "cancelled";
        request.cancelledAt = new Date();
        await request.save();

        revalidatePath("/me/leave-requests");
        revalidatePath("/team/leave-requests");
        revalidatePath(`/me/leave-requests/${id}`);

        // Notify the manager — best-effort, the cancellation is already persisted.
        try {
            const employeeDoc = await Employee.findById(employeeId)
                .populate("managerId", "firstName lastName email")
                .lean();
            const manager = employeeDoc?.managerId as
                | { _id?: unknown; email?: string }
                | undefined;
            const managerEmail = manager?.email?.trim();
            const managerIsRequester = String(manager?._id ?? "") === String(employeeId);

            if (!managerEmail) {
                console.log("[cancelMyLeaveRequest] No manager email — skipping notification");
            } else if (managerIsRequester) {
                console.log("[cancelMyLeaveRequest] Manager is the requester — skipping notification");
            } else {
                await sendEmail({
                    to: managerEmail,
                    ...buildLeaveRequestCancelledEmail(toLeaveRequestEmailData(request)),
                });
                console.log(`[cancelMyLeaveRequest] Manager notification sent for request ${id}`);
            }
        } catch (emailError) {
            console.error(
                "[cancelMyLeaveRequest] Failed to send cancellation email:",
                emailError instanceof Error ? emailError.message : emailError
            );
        }

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error cancelling leave request:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to cancel leave request",
        };
    }
}