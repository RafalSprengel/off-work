"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { CreateLeaveRequestInput } from "@/types/leaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import mongoose from "mongoose";

dayjs.extend(isSameOrBefore);

export async function createLeaveRequest(data: CreateLeaveRequestInput) {
    await connectDB();
    const { startDate, endDate } = data;

    const start = dayjs(startDate, "YYYY-MM-DD");
    const end = dayjs(endDate, "YYYY-MM-DD");

    if (!start.isValid() || !end.isValid() || start.isAfter(end)) {
        return { error: "Invalid date range" };
    }

    const organizationId = await getOrganizationId();

    const nonWorkingDays = await getNonWorkingDays(
        organizationId,
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

    const newRequest = await LeaveRequest.create({
        organizationId,
        employee,
        startDate: start.format("YYYY-MM-DD"),
        endDate: end.format("YYYY-MM-DD"),
        startHalfDay: false,
        endHalfDay: false,
        daysRequested: workingDays,
        status: "pending",
        createdBy: employee,
    });

    return { success: true, requestId: newRequest._id.toString() };
}