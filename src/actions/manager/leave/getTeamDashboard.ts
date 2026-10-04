"use server";

import connectDB from "@/db/connection";
import Employee from "@/db/models/Employee";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { computeLeaveDaysRequested } from "@/utils/workingDays";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import isoWeek from "dayjs/plugin/isoWeek";
import mongoose from "mongoose";
import type { TeamDashboardData, PendingRequestItem, DepartmentOverviewItem } from "@/types/dashboard";

dayjs.extend(dayOfYear);
dayjs.extend(isoWeek);

export async function getTeamDashboard() {
    try {
        await connectDB();
        const orgId = await getOrganizationId();

        if (!orgId) {
            return { success: false, error: "Organization ID is missing" };
        }

        const orgObjectId =
            typeof orgId === "string" && mongoose.Types.ObjectId.isValid(orgId)
                ? new mongoose.Types.ObjectId(orgId)
                : orgId;

        const today = dayjs();
        const todayStr = today.format("YYYY-MM-DD");
        const startOfWeek = today.startOf("isoWeek");
        const endOfWeek = today.endOf("isoWeek");

        const startOfWeekStr = startOfWeek.format("YYYY-MM-DD");
        const endOfWeekStr = endOfWeek.format("YYYY-MM-DD");
        const tomorrowStr = today.add(1, "day").format("YYYY-MM-DD");

        const [
            totalEmployees,
            pendingApprovals,
            onLeaveThisWeek,
            activeOnLeave,
            todayAbsencesRaw,
            upcomingAbsencesRaw,
            pendingRequestsRaw,

            deptEmployeeCounts,

            deptOnLeaveRaw,
        ] = await Promise.all([
            Employee.countDocuments({
                organizationId: orgId,
                status: { $in: ["active", "invited"] },
            }),

            LeaveRequest.countDocuments({
                organizationId: orgId,
                status: "pending",
            }),

            LeaveRequest.countDocuments({
                organizationId: orgId,
                status: "approved",
                startDate: { $lte: endOfWeekStr },
                endDate: { $gte: startOfWeekStr },
            }),

            LeaveRequest.countDocuments({
                organizationId: orgId,
                status: "approved",
                startDate: { $lte: todayStr },
                endDate: { $gte: todayStr },
            }),

            LeaveRequest.find({
                organizationId: orgId,
                status: "approved",
                startDate: { $lte: todayStr },
                endDate: { $gte: todayStr },
            })
                .sort({ createdAt: -1 })
                .lean(),

            LeaveRequest.find({
                organizationId: orgId,
                status: "approved",
                startDate: { $gte: tomorrowStr },
            })
                .sort({ startDate: 1 })
                .limit(10)
                .lean(),

            LeaveRequest.find({
                organizationId: orgId,
                status: "pending",
            })
                .sort({ createdAt: -1 })
                .limit(4)
                .lean(),

            Employee.aggregate<{ _id: unknown; name: string; count: number }>(
                [
                    {
                        $match: {
                            $or: [
                                { organizationId: orgId },
                                { organizationId: orgObjectId },
                            ],
                            status: { $in: ["active", "invited"] },
                        },
                    },
                    {
                        $lookup: {
                            from: "departments",
                            localField: "department",
                            foreignField: "_id",
                            as: "dept",
                        },
                    },
                    { $unwind: "$dept" },
                    {
                        $group: {
                            _id: "$dept._id",
                            name: { $first: "$dept.name" },
                            count: { $sum: 1 },
                        },
                    },
                    { $sort: { count: -1 } },
                ],
            ),

            LeaveRequest.aggregate<{
                _id: unknown;
                onLeave: number;
            }>([
                {
                    $match: {
                        organizationId: orgId,
                        status: "approved",
                        startDate: { $lte: endOfWeekStr },
                        endDate: { $gte: startOfWeekStr },
                    },
                },
                {
                    $lookup: {
                        from: "employees",
                        localField: "employee",
                        foreignField: "_id",
                        as: "emp",
                    },
                },
                { $unwind: "$emp" },
                {
                    $group: {
                        _id: "$emp.department",
                        onLeave: { $sum: 1 },
                    },
                },
            ]),
        ]);

        // daysRequested jest wartoscia pochodna - liczymy dla wszystkich list
        // z aktualnych dni nieroboczych (jeden zakres dla calosci).
        const dashboardDocs = [
            ...todayAbsencesRaw,
            ...upcomingAbsencesRaw,
            ...pendingRequestsRaw,
        ];

        let dashboardNonWorkingDates: Set<string> = new Set();
        if (dashboardDocs.length > 0) {
            const minStart = dashboardDocs.reduce(
                (min, d) => (d.startDate < min ? d.startDate : min),
                dashboardDocs[0].startDate
            );
            const maxEnd = dashboardDocs.reduce(
                (max, d) => (d.endDate > max ? d.endDate : max),
                dashboardDocs[0].endDate
            );
            dashboardNonWorkingDates = await getNonWorkingDays(orgId, minStart, maxEnd);
        }

        const toPendingItem = (doc: {
            startDate: string;
            endDate: string;
            startHalfDay?: boolean;
            endHalfDay?: boolean;
        }): PendingRequestItem => {
            const item = JSON.parse(JSON.stringify(doc)) as PendingRequestItem;
            item.daysRequested = computeLeaveDaysRequested(
                doc.startDate,
                doc.endDate,
                doc.startHalfDay ?? false,
                doc.endHalfDay ?? false,
                dashboardNonWorkingDates
            );
            return item;
        };

        const todayAbsences = todayAbsencesRaw.map(toPendingItem);
        const upcomingAbsences = upcomingAbsencesRaw.map(toPendingItem);
        const pendingRequests = pendingRequestsRaw.map(toPendingItem);

        const onLeaveMap = new Map<string, number>();
        for (const row of deptOnLeaveRaw) {
            onLeaveMap.set(String(row._id), row.onLeave);
        }

        const departmentOverview: DepartmentOverviewItem[] =
            deptEmployeeCounts.map((d) => ({
                name: d.name,
                count: d.count,
                onLeave: onLeaveMap.get(String(d._id)) ?? 0,
            }));

        return {
            success: true,
            data: {
                totalEmployees,
                activeOnLeave,
                pendingApprovals,
                onLeaveThisWeek,
                todayAbsences,
                upcomingAbsences,
                pendingRequests,
                departmentOverview,
            } as TeamDashboardData,
        };
    } catch (error: unknown) {
        console.error("Error fetching team dashboard:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch dashboard data",
        };
    }
}