"use server";

import dbConnect from "@/db/connection";
import Absence from "@/db/models/Absence";
import { getOrganizationId } from "@/utils/getOrganizationId";
import type { IAbsenceItem, GetAbsencesResult } from "@/types/absence";

export async function getAbsences(
    fromDate?: string,
    toDate?: string,
    employeeId?: string
): Promise<GetAbsencesResult> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const filter: Record<string, unknown> = { organizationId };

        if (employeeId) {
            filter.employee = employeeId;
        }

        if (fromDate || toDate) {
            const dateFilter: Record<string, string> = {};
            if (fromDate) dateFilter.$gte = fromDate;
            if (toDate) dateFilter.$lte = toDate;
            filter.startDate = dateFilter;
        }

        const absences = await Absence.find(filter).sort({ startDate: -1 }).lean();

        const data: IAbsenceItem[] = absences.map((a) => ({
            id: a._id.toString(),
            employee: a.employee.toString(),
            employeeName: a.employeeName,
            employeeEmail: a.employeeEmail,
            departmentName: a.departmentName,
            startDate: a.startDate,
            endDate: a.endDate,
            daysCount: a.daysCount,
            type: a.type,
            note: a.note,
            createdBy: a.createdBy.toString(),
            createdAt: a.createdAt.toISOString(),
        }));

        return { success: true, data, error: null };
    } catch (error) {
        console.error("Error fetching absences:", error);
        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : "Failed to load absences",
        };
    }
}
