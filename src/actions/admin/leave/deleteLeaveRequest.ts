"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";

export async function deleteLeaveRequestAsAdmin(id: string) {
    try {
        await connectDB();
        const organizationId = await getOrganizationId();

        const request = await LeaveRequest.findOneAndDelete({
            _id: id,
            organizationId,
        });

        if (!request) {
            return { success: false, error: "Leave request not found." };
        }

        revalidatePath("/team/leave-requests");
        revalidatePath("/me/leave-requests");
        revalidatePath("/team/employees", "layout");
        revalidatePath("/team/calendar");
        revalidatePath(`/team/leave-requests/${id}`);

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error deleting leave request as admin:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to delete leave request",
        };
    }
}
