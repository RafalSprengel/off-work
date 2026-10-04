"use server";

import dayjs from "dayjs";
import mongoose from "mongoose";

import dbConnect from "@/db/connection";
import Absence from "@/db/models/Absence";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { countWorkingDays } from "@/utils/workingDays";

/**
 * Liczba dni chorobowych pracownika w biezacym roku kalendarzowym.
 * Sumuje nieobecnosci (Absence) typu "sick" oraz zatwierdzone wnioski (LeaveRequest)
 * typu "sick", liczone w dniach roboczych.
 */
export async function getMySickDaysThisYear(): Promise<{
    success: boolean;
    days: number;
    error?: string;
}> {
    try {
        await dbConnect();
        const employeeId = await getCurrentEmployeeId();
        const organizationId = await getOrganizationId();

        const year = dayjs().year();
        const start = `${year}-01-01`;
        const end = `${year}-12-31`;
        const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

        const [absences, requests, nonWorkingDates] = await Promise.all([
            Absence.find({
                organizationId,
                employee: employeeObjectId,
                type: "sick",
                startDate: { $lte: end },
                endDate: { $gte: start },
            })
                .select("startDate endDate")
                .lean(),
            LeaveRequest.find({
                organizationId,
                employee: employeeObjectId,
                type: "sick",
                status: "approved",
                startDate: { $lte: end },
                endDate: { $gte: start },
            })
                .select("startDate endDate")
                .lean(),
            getNonWorkingDays(organizationId, start, end),
        ]);

        const clampStart = (date: string) => (date < start ? start : date);
        const clampEnd = (date: string) => (date > end ? end : date);

        const days = [...absences, ...requests].reduce(
            (sum, item) =>
                sum +
                countWorkingDays(
                    clampStart(item.startDate),
                    clampEnd(item.endDate),
                    nonWorkingDates
                ),
            0
        );

        return { success: true, days };
    } catch (error) {
        console.error("Error computing sick days this year:", error);
        return {
            success: false,
            days: 0,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to compute sick days",
        };
    }
}
