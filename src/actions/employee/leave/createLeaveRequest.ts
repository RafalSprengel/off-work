"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import dayjs from "dayjs";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { countWorkingDaysForOrg } from "@/utils/nonWorkingDays";
import { CreateLeaveRequestInput } from "@/types/leaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import Employee from "@/db/models/Employee";
import mongoose from "mongoose";
import { revalidatePath } from "next/cache";

export async function createLeaveRequest(data: CreateLeaveRequestInput) {
    await connectDB();
    const { startDate, endDate, comment } = data;

    const start = dayjs(startDate, "YYYY-MM-DD");
    const end = dayjs(endDate, "YYYY-MM-DD");

    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
        return { error: "Invalid date range" };
    }

    const organizationId = await getOrganizationId();

    const workingDays = await countWorkingDaysForOrg(
        organizationId,
        start.format("YYYY-MM-DD"),
        end.format("YYYY-MM-DD")
    );

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
        .populate("managerId", "firstName lastName")
        .lean();

    const dept = employeeDoc?.department as { name?: string } | undefined;
    const mgr = employeeDoc?.managerId as { firstName?: string; lastName?: string } | undefined;

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
        status: "pending",
        createdBy: employee,
        comment: comment || "",
        ...employeeInfo,
    });

    revalidatePath("/me/leave-requests");
    revalidatePath("/team/leave-requests");
    revalidatePath("/me/calendar");
    revalidatePath("/team/calendar");

    return { success: true, requestId: newRequest._id.toString() };
}