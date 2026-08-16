"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import dayjs from "dayjs";
import isSameOrBefore from "dayjs/plugin/isSameOrBefore";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { revalidatePath } from "next/cache";
import { CreateLeaveRequestParams } from "@/types/leaveRequest";

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
            return {
                success: false,
                error: "Selected range contains no working days",
            };
        }

        const newLeaveRequest = await LeaveRequest.create({
            employee: data.userId,
            organizationId: orgId,
            startDate: start.format("YYYY-MM-DD"),
            endDate: end.format("YYYY-MM-DD"),
            startHalfDay: data.startHalfDay || false,
            endHalfDay: data.endHalfDay || false,
            daysRequested,
            status: "approved",
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
            error: error instanceof Error
                ? error.message
                : "Failed to create leave request",
        };
    }
}