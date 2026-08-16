"use server";

import connectDB from "@/db/connection";
import Department from "@/db/models/Department";
import Employee from "@/db/models/Employee";
import LeaveRequest from "@/db/models/LeaveRequest";
import { getOrganizationId } from "@/utils/getOrganizationId";
import dayjs from "dayjs";
import dayOfYear from "dayjs/plugin/dayOfYear";
import mongoose from "mongoose";

dayjs.extend(dayOfYear);

export interface TeamDashboardData {
    totalEmployees: number;
    activeOnLeave: number;
    pendingApprovals: number;
    onLeaveThisWeek: number;
    todayAbsences: PendingRequestItem[];
    pendingRequests: PendingRequestItem[];
    departmentOverview: DepartmentOverviewItem[];
}

export interface PendingRequestItem {
    _id: string;
    employee: {
        _id: string;
        firstName: string;
        lastName: string;
        department?: {
            _id: string;
            name: string;
        };
    };
    startDate: string;
    endDate: string;
    daysRequested: number;
    type: "annual" | "sick" | "unpaid" | "other";
    createdAt: string;
}

export interface DepartmentOverviewItem {
    name: string;
    count: number;
    onLeave: number;
}

export async function getTeamDashboard() {
    try {
        await connectDB();
        const orgId = await getOrganizationId();

        if (!orgId) {
            return { success: false, error: "Organization ID is missing" };
        }

        // Upewniamy się, że model Department jest załadowany w pamięci Mongoose
        if (!mongoose.models.Department) {
            void Department;
        }

        // Konwersja orgId na Types.ObjectId dla zgodności z agregacją MongoDB
        const orgObjectId =
            typeof orgId === "string" && mongoose.Types.ObjectId.isValid(orgId)
                ? new mongoose.Types.ObjectId(orgId)
                : orgId;

        // Total active employees (including invited)
        const totalEmployees = await Employee.countDocuments({
            organizationId: orgId,
            status: { $in: ["active", "invited"] },
        });

        // Pending leave requests count
        const pendingApprovals = await LeaveRequest.countDocuments({
            organizationId: orgId,
            status: "pending",
        });

        // Get current week boundaries (Monday to Sunday)
        const today = dayjs();
        const startOfWeek = today.startOf("week").add(1, "day"); // Monday
        const endOfWeek = today.endOf("week").add(1, "day"); // Sunday

        const startOfWeekStr = startOfWeek.format("YYYY-MM-DD");
        const endOfWeekStr = endOfWeek.format("YYYY-MM-DD");

        // Approved leave requests overlapping with this week
        const onLeaveThisWeek = await LeaveRequest.countDocuments({
            organizationId: orgId,
            status: "approved",
            startDate: { $lte: endOfWeekStr },
            endDate: { $gte: startOfWeekStr },
        });

        // Active on leave (approved, currently ongoing)
        const activeOnLeave = await LeaveRequest.countDocuments({
            organizationId: orgId,
            status: "approved",
            startDate: { $lte: today.format("YYYY-MM-DD") },
            endDate: { $gte: today.format("YYYY-MM-DD") },
        });

        // Today absences (approved, covering today)
        const todayAbsencesRaw = await LeaveRequest.find({
            organizationId: orgId,
            status: "approved",
            startDate: { $lte: today.format("YYYY-MM-DD") },
            endDate: { $gte: today.format("YYYY-MM-DD") },
        })
            .populate({
                path: "employee",
                select: "firstName lastName department",
                populate: {
                    path: "department",
                    select: "name",
                },
            })
            .sort({ createdAt: -1 })
            .lean();

        const todayAbsences = JSON.parse(
            JSON.stringify(todayAbsencesRaw)
        ) as PendingRequestItem[];

        // Pending requests for the table (latest 4)
        const pendingRequestsRaw = await LeaveRequest.find({
            organizationId: orgId,
            status: "pending",
        })
            .populate({
                path: "employee",
                select: "firstName lastName department",
                populate: {
                    path: "department",
                    select: "name",
                },
            })
            .sort({ createdAt: -1 })
            .limit(4)
            .lean();

        const pendingRequests = JSON.parse(
            JSON.stringify(pendingRequestsRaw)
        ) as PendingRequestItem[];

        // Department overview
        const departments = await Employee.aggregate([
            {
                $match: {
                    $or: [
                        { organizationId: orgId },
                        { organizationId: orgObjectId }
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
        ]);
        console.log('departments', departments);

        // For each department, count how many are on approved leave this week
        const departmentOverview: DepartmentOverviewItem[] = [];
        for (const dept of departments) {
            const onLeave = await LeaveRequest.countDocuments({
                organizationId: orgId,
                status: "approved",
                startDate: { $lte: endOfWeekStr },
                endDate: { $gte: startOfWeekStr },
                employee: {
                    $in: (
                        await Employee.find({
                            organizationId: orgId,
                            department: dept._id,
                            status: { $in: ["active", "invited"] },
                        }).select("_id")
                    ).map((e) => e._id),
                },
            });
            departmentOverview.push({
                name: dept.name,
                count: dept.count,
                onLeave,
            });
        }

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