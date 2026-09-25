"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import Employee from "@/db/models/Employee";
import { getOrganizationId } from "@/utils/getOrganizationId";

export interface ReportDataItem {
    _id: string;
    employee?: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    status: "pending" | "approved" | "rejected";
    type: "annual" | "sick" | "unpaid" | "other";
    employeeName?: string;
    employeeEmail?: string;
    departmentName?: string;
    createdAt: string;
}

export interface EmployeeReportItem {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    departmentName?: string;
    employmentDate: string;
    status: "active" | "inactive" | "invited";
    role: "Manager" | "Employee";
}

export interface ReportData {
    leaveRequests: ReportDataItem[];
    employees: EmployeeReportItem[];
}

export async function getReportData(): Promise<{
    success: boolean;
    data?: ReportData;
    error?: string;
}> {
    try {
        await connectDB();
        const orgId = await getOrganizationId();

        if (!orgId) {
            return { success: false, error: "Organization ID is missing" };
        }

        const leaveRequests = await LeaveRequest.find({
            organizationId: orgId,
            status: "approved",
        })
            .sort({ createdAt: -1 })
            .lean();

        const employees = await Employee.find({
            organizationId: orgId,
        })
            .populate("department", "name")
            .sort({ firstName: 1 })
            .lean();

        const mappedRequests: ReportDataItem[] = leaveRequests.map((lr) => ({
            _id: String(lr._id),
            employee: lr.employee ? String(lr.employee) : undefined,
            startDate: lr.startDate,
            endDate: lr.endDate,
            daysRequested: lr.daysRequested,
            status: lr.status,
            type: lr.type,
            employeeName: lr.employeeName,
            employeeEmail: lr.employeeEmail,
            departmentName: lr.departmentName,
            createdAt: lr.createdAt ? lr.createdAt.toISOString() : "",
        }));

        const mappedEmployees: EmployeeReportItem[] = employees.map((emp) => {
            const dept = emp.department as unknown as
                | { _id: string; name: string }
                | undefined;
            return {
                _id: String(emp._id),
                firstName: emp.firstName,
                lastName: emp.lastName,
                email: emp.email,
                departmentName: dept?.name,
                employmentDate: emp.employmentDate
                    ? new Date(emp.employmentDate).toISOString()
                    : "",
                status: emp.status,
                role: emp.role,
            };
        });

        return {
            success: true,
            data: {
                leaveRequests: mappedRequests,
                employees: mappedEmployees,
            },
        };
    } catch (error: unknown) {
        console.error("Error fetching report data:", error);
        return {
            success: false,
            error:
                error instanceof Error
                    ? error.message
                    : "Failed to fetch report data",
        };
    }
}