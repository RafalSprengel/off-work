"use server";

import connectDB from "@/db/connection";
import Employee from "@/db/models/Employee";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import mongoose from "mongoose";
import type { TeamDashboardData, PendingRequestItem, DepartmentOverviewItem } from "@/types/dashboard";

dayjs.extend(dayOfYear);

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
        const startOfWeek = today.startOf("week").add(1, "day");
        const endOfWeek = today.endOf("week").add(1, "day");

        const startOfWeekStr = startOfWeek.format("YYYY-MM-DD");
        const endOfWeekStr = endOfWeek.format("YYYY-MM-DD");

        const [
            totalEmployees,
            pendingApprovals,
            onLeaveThisWeek,
            activeOnLeave,
            todayAbsencesRaw,
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

        const todayAbsences = JSON.parse(
            JSON.stringify(todayAbsencesRaw)
        ) as PendingRequestItem[];

        const pendingRequests = JSON.parse(
            JSON.stringify(pendingRequestsRaw)
        ) as PendingRequestItem[];

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