"use server";

import dbConnect from "@/db/connection";
import LeaveAllowance from "@/db/models/LeaveAllowance";
import { getOrganizationId } from "@/utils/getOrganizationId";
import mongoose from "mongoose";
import type {
    GetLeaveAllowancesResult,
    ILeaveAllowanceItem,
} from "@/types/leaveAllowance";

export async function getLeaveAllowances(
    employeeId: string
): Promise<GetLeaveAllowancesResult> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const docs = await LeaveAllowance.find({
            organizationId,
            employee: new mongoose.Types.ObjectId(employeeId),
        }).lean();

        const data: ILeaveAllowanceItem[] = docs.map((doc) => ({
            id: doc._id.toString(),
            employee: doc.employee.toString(),
            type: doc.type,
            days: doc.days,
        }));

        return { success: true, data, error: null };
    } catch (error) {
        console.error("Error fetching leave allowances:", error);
        return {
            success: false,
            data: [],
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to load leave allowances",
        };
    }
}
