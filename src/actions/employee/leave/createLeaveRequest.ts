"use server";

import dayjs from "dayjs";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import connectDB from "@/db/connection";
import Employee from "@/db/models/Employee";
import LeaveRequest from "@/db/models/LeaveRequest";
import {
    buildNewLeaveRequestEmail,
    toLeaveRequestEmailData,
} from "@/lib/emails/leaveRequestEmails";
import { sendEmail } from "@/lib/sendEmail";
import type { CreateLeaveRequestInput } from "@/types/leaveRequest";
import { formatDateList } from "@/utils/formatDateList";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { countWorkingDays } from "@/utils/workingDays";

export async function createLeaveRequest(data: CreateLeaveRequestInput) {
    await connectDB();
    const { startDate, endDate, type, comment } = data;

    const start = dayjs(startDate, "YYYY-MM-DD");
    const end = dayjs(endDate, "YYYY-MM-DD");

    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
        return { error: "Invalid date range" };
    }

    const organizationId = await getOrganizationId();

    const startStr = start.format("YYYY-MM-DD");
    const endStr = end.format("YYYY-MM-DD");

    // Twarda blokada: wniosek nie moze obejmowac bank holiday ani company closure.
    const nonWorkingDays = await getNonWorkingDays(organizationId, startStr, endStr);

    if (nonWorkingDays.size > 0) {
        return {
            error: `Selected range includes non-working days (${formatDateList([
                ...nonWorkingDays,
            ])}). Please choose a range without bank holidays or company closures.`,
        };
    }

    const workingDays = countWorkingDays(startStr, endStr, nonWorkingDays);

    if (workingDays === 0) {
        return { error: "Selected range contains no working days" };
    }

    const employee = await getCurrentEmployeeId();

    const existingConflict = await LeaveRequest.findOne({
        employee: new mongoose.Types.ObjectId(employee),
        status: { $in: ["pending", "approved"] },
        organizationId,
        startDate: { $lte: end.format("YYYY-MM-DD") },
        endDate: { $gte: start.format("YYYY-MM-DD") },
    });

    if (existingConflict) {
        return { error: "Selected dates overlap with an existing request" };
    }

    const employeeDoc = await Employee.findById(employee)
        .populate("department", "name")
        .populate("managerId", "firstName lastName email")
        .lean();

    const dept = employeeDoc?.department as { name?: string } | undefined;
    const mgr = employeeDoc?.managerId as
        | { _id?: unknown; firstName?: string; lastName?: string; email?: string }
        | undefined;

    const employeeInfo = {
        employeeName: employeeDoc ? `${employeeDoc.firstName} ${employeeDoc.lastName}` : "Unknown",
        employeeEmail: employeeDoc?.email || "",
        departmentName: dept?.name || "",
        managerName: mgr ? `${mgr.firstName} ${mgr.lastName}` : "",
    };

    const newRequest = await LeaveRequest.create({
        organizationId,
        employee,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        startHalfDay: false,
        endHalfDay: false,
        type: type ?? "annual",
        status: "pending",
        createdBy: employee,
        comment: comment || "",
        ...employeeInfo,
    });

    revalidatePath("/me/leave-requests");
    revalidatePath("/team/leave-requests");
    revalidatePath("/me/calendar");
    revalidatePath("/team/calendar");

    // Notify the manager — best-effort, the request is already persisted.
    const managerEmail = mgr?.email?.trim();
    const managerIsRequester = String(mgr?._id ?? "") === String(employee);

    if (!managerEmail) {
        console.log("[createLeaveRequest] No manager email — skipping notification");
    } else if (managerIsRequester) {
        console.log("[createLeaveRequest] Manager is the requester — skipping notification");
    } else {
        try {
            await sendEmail({
                to: managerEmail,
                ...buildNewLeaveRequestEmail(toLeaveRequestEmailData(newRequest)),
            });
            console.log(`[createLeaveRequest] Manager notification sent for request ${newRequest._id}`);
        } catch (emailError) {
            console.error(
                "[createLeaveRequest] Failed to send manager notification email:",
                emailError instanceof Error ? emailError.message : emailError
            );
        }
    }

    return { success: true, requestId: newRequest._id.toString() };
}