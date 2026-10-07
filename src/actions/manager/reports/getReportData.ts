"use server";

import connectDB from "@/db/connection";
import LeaveRequest from "@/db/models/LeaveRequest";
import Employee from "@/db/models/Employee";
import Absence, { type AbsenceType } from "@/db/models/Absence";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { computeLeaveDaysRequested } from "@/utils/workingDays";
import type { LeaveRequestType } from "@/constants/leaveTypes";

export interface ReportDataItem {
    _id: string;
    employee?: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    status: "pending" | "approved" | "rejected" | "cancelled";
    type: LeaveRequestType;
    employeeName?: string;
    employeeEmail?: string;
    departmentName?: string;
    createdAt: string;
}

export interface AbsenceReportItem {
    _id: string;
    employee?: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    type: AbsenceType;
    employeeName?: string;
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
    absences: AbsenceReportItem[];
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

        const absences = await Absence.find({
            organizationId: orgId,
        })
            .sort({ startDate: -1 })
            .lean();

        const employees = await Employee.find({
            organizationId: orgId,
        })
            .populate("department", "name")
            .sort({ firstName: 1 })
            .lean();

        // daysRequested jest wartoscia pochodna - liczymy z aktualnych dni nieroboczych.
        // Zakres obejmuje zarowno wnioski urlopowe, jak i nieobecnosci (absences),
        // bo oba zrodla sa prezentowane w raportach.
        const rangeItems = [...leaveRequests, ...absences];
        const nonWorkingDates =
            rangeItems.length > 0
                ? await getNonWorkingDays(
                      orgId,
                      rangeItems.reduce(
                          (min, r) => (r.startDate < min ? r.startDate : min),
                          rangeItems[0].startDate
                      ),
                      rangeItems.reduce(
                          (max, r) => (r.endDate > max ? r.endDate : max),
                          rangeItems[0].endDate
                      )
                  )
                : new Set<string>();

        const mappedRequests: ReportDataItem[] = leaveRequests.map((lr) => ({
            _id: String(lr._id),
            employee: lr.employee ? String(lr.employee) : undefined,
            startDate: lr.startDate,
            endDate: lr.endDate,
            daysRequested: computeLeaveDaysRequested(
                lr.startDate,
                lr.endDate,
                lr.startHalfDay,
                lr.endHalfDay,
                nonWorkingDates
            ),
            status: lr.status,
            type: lr.type,
            employeeName: lr.employeeName,
            employeeEmail: lr.employeeEmail,
            departmentName: lr.departmentName,
            createdAt: lr.createdAt ? lr.createdAt.toISOString() : "",
        }));

        const mappedAbsences: AbsenceReportItem[] = absences.map((a) => ({
            _id: String(a._id),
            employee: a.employee ? String(a.employee) : undefined,
            startDate: a.startDate,
            endDate: a.endDate,
            daysRequested: computeLeaveDaysRequested(
                a.startDate,
                a.endDate,
                false,
                false,
                nonWorkingDates
            ),
            // Starsze/niekompletne wpisy moga nie miec typu - traktujemy je jako "other".
            type: a.type ?? "other",
            employeeName: a.employeeName,
            departmentName: a.departmentName,
            createdAt: a.createdAt ? a.createdAt.toISOString() : "",
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
                absences: mappedAbsences,
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