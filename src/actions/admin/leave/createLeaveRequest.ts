"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { revalidatePath } from "next/cache";
import { CreateLeaveRequestParams } from "@/types/leaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import Employee from "@/db/models/Employee";
import mongoose from "mongoose";

dayjs.extend(isSameOrBefore);

export async function createLeaveRequest(data: CreateLeaveRequestParams) {
    try {
        await connectDB();

        if (!data.userId) {
            return { success: false, error: "Please select an employee" };
        }

        if (!data.startDate || !data.endDate) {
            return { success: false, error: "Please select start and end dates" };
        }

        const orgId = await getOrganizationId();

        if (!orgId) {
            return { success: false, error: "Organization ID is missing or undefined" };
        }

        const start = dayjs(data.startDate, "YYYY-MM-DD");
        const end = dayjs(data.endDate, "YYYY-MM-DD");

        if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
            return { success: false, error: "Invalid date range selected" };
        }

        const existingConflict = await LeaveRequest.findOne({
            employee: new mongoose.Types.ObjectId(data.userId),
            organizationId: orgId,
            status: { $in: ["pending", "approved"] },
            startDate: { $lte: end.format("YYYY-MM-DD") },
            endDate: { $gte: start.format("YYYY-MM-DD") },
        });

        if (existingConflict) {
            return {
                success: false,
                error: "Selected dates overlap with an existing leave request for this employee.",
            };
        }

        const nonWorkingDays = await getNonWorkingDays(
            orgId,
            start.format("YYYY-MM-DD"),
            end.format("YYYY-MM-DD")
        );

        let workingDays = 0;
        let current = start;
        while (current.isSameOrBefore(end, "day")) {
            const dayOfWeek = current.day();
            const formattedDate = current.format("YYYY-MM-DD");
            const isWeekend = dayOfWeek === 0 || dayOfWeek === 6;
            const isNonWorking = nonWorkingDays.has(formattedDate);

            if (!isWeekend && !isNonWorking) {
                workingDays++;
            }
            current = current.add(1, "day");
        }

        let daysRequested = workingDays;
        if (data.startHalfDay) daysRequested -= 0.5;
        if (data.endHalfDay) daysRequested -= 0.5;

        if (daysRequested <= 0) {
            return { success: false, error: "Selected range contains no working days" };
        }

        const adminId = await getCurrentEmployeeId();

        const [employeeDoc, adminDoc] = await Promise.all([
            Employee.findById(data.userId)
                .populate("department", "name")
                .populate("managerId", "firstName lastName")
                .lean(),
            Employee.findById(adminId).lean(),
        ]);

        const dept = employeeDoc?.department as { name?: string } | undefined;
        const mgr = employeeDoc?.managerId as { firstName?: string; lastName?: string } | undefined;

        // Provide default non-undefined values so Mongoose doesn't strip the entire snapshot subdocument
        const snapshot = {
            employeeName: employeeDoc ? `${employeeDoc.firstName} ${employeeDoc.lastName}` : "Unknown",
            employeeEmail: employeeDoc?.email || "",
            departmentName: dept?.name || "",
            managerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : "",
            approvedByName: adminDoc ? `${adminDoc.firstName} ${adminDoc.lastName}` : "",
        };

        const newLeaveRequest = await LeaveRequest.create({
            employee: data.userId,
            organizationId: orgId,
            startDate: start.format("YYYY-MM-DD"),
            endDate: end.format("YYYY-MM-DD"),
            startHalfDay: data.startHalfDay || false,
            endHalfDay: data.endHalfDay || false,
            daysRequested,
            status: "approved",
            createdBy: adminId,
            approvedBy: adminId,
            approvedAt: new Date(),
            snapshot,
        });

        revalidatePath("/team/leave-requests");

        return {
            success: true,
            data: JSON.parse(JSON.stringify(newLeaveRequest)),
            error: null,
        };
    } catch (error: unknown) {
        console.error("Error creating leave request as admin:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create leave request",
        };
    }
}