"use server";

import connectDB from "@/db/connection";
import LeaveAllowance from "@/db/models/LeaveAllowance";
import LeaveRequest from "@/db/models/LeaveRequest";
import OrganizationSettings from "@/db/models/OrganizationSettings";
import { getCurrentEmployeeId } from "@/actions/shared/getCurrentEmployeeId";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { countWorkingDays } from "@/utils/workingDays";
import { LEAVE_REQUEST_TYPES, type LeaveRequestType } from "@/constants/leaveTypes";
import mongoose from "mongoose";
import dayjs from "dayjs";

export interface LeaveBalanceItem {
    type: LeaveRequestType;
    allowance: number;
    used: number;
    remaining: number;
}

export type GetMyLeaveBalanceResult =
    | { success: true; data: LeaveBalanceItem[]; error: null }
    | { success: false; data: null; error: string };

const DEFAULT_ALLOWANCES: Record<LeaveRequestType, number> = {
    annual: 26,
    sick: 10,
    unpaid: 0,
    bereavement: 5,
};

export async function getMyLeaveBalance(): Promise<GetMyLeaveBalanceResult> {
    try {
        await connectDB();

        const organizationId = await getOrganizationId();
        const employeeId = await getCurrentEmployeeId();
        const employeeObjectId = new mongoose.Types.ObjectId(employeeId);

        const orgSettings = await OrganizationSettings.findOne({ organizationId }).lean();

        const rawDefaultAllowances = orgSettings?.defaultAllowances
            ? Object.fromEntries(orgSettings.defaultAllowances as Map<string, number>)
            : {};

        const perEmployeeAllowances = await LeaveAllowance.find({
            organizationId,
            employee: employeeObjectId,
        }).lean();

        const perEmployeeMap = new Map(perEmployeeAllowances.map((a) => [a.type, a.days]));

        const holidayYearStart = orgSettings?.holidayYearStart ?? "01-01";
        const now = dayjs();
        const [startMonth, startDay] = holidayYearStart.split("-").map(Number);

        let yearStart = dayjs()
            .year(now.year())
            .month(startMonth - 1)
            .date(startDay)
            .startOf("day");

        if (now.isBefore(yearStart)) {
            yearStart = yearStart.subtract(1, "year");
        }

        const yearEnd = yearStart.add(1, "year").subtract(1, "day").endOf("day");

        const approvedRequests = await LeaveRequest.find({
            organizationId,
            employee: employeeObjectId,
            status: "approved",
            startDate: { $lte: yearEnd.format("YYYY-MM-DD") },
            endDate: { $gte: yearStart.format("YYYY-MM-DD") },
        })
            .select("type startDate endDate")
            .lean();

        const nonWorkingDays = await getNonWorkingDays(
            organizationId,
            yearStart.format("YYYY-MM-DD"),
            yearEnd.format("YYYY-MM-DD")
        );

        const usedByType = new Map<string, number>();
        for (const req of approvedRequests) {
            const effectiveStart = req.startDate < yearStart.format("YYYY-MM-DD")
                ? yearStart.format("YYYY-MM-DD")
                : req.startDate;
            const effectiveEnd = req.endDate > yearEnd.format("YYYY-MM-DD")
                ? yearEnd.format("YYYY-MM-DD")
                : req.endDate;

            const days = countWorkingDays(effectiveStart, effectiveEnd, nonWorkingDays);
            usedByType.set(req.type, (usedByType.get(req.type) ?? 0) + days);
        }

        const data: LeaveBalanceItem[] = LEAVE_REQUEST_TYPES.map((type) => {
            const allowance: number =
                perEmployeeMap.has(type)
                    ? (perEmployeeMap.get(type) as number)
                    : (rawDefaultAllowances[type] ?? DEFAULT_ALLOWANCES[type]);

            const used = usedByType.get(type) ?? 0;
            return {
                type,
                allowance,
                used,
                remaining: Math.max(0, allowance - used),
            };
        });

        return { success: true, data, error: null };
    } catch (error) {
        console.error("Error fetching leave balance:", error);
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : "Failed to load leave balance",
        };
    }
}
