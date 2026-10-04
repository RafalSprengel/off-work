"use server";

import dbConnect from "@/db/connection";
import Absence from "@/db/models/Absence";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { countWorkingDays } from "@/utils/workingDays";
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

        // daysCount jest wartoscia pochodna - liczymy ja z aktualnych dni nieroboczych
        // (jedno zapytanie dla calego zakresu, potem liczenie w pamieci).
        let nonWorkingDates: Set<string> = new Set();
        if (absences.length > 0) {
            const minStart = absences.reduce(
                (min, a) => (a.startDate < min ? a.startDate : min),
                absences[0].startDate
            );
            const maxEnd = absences.reduce(
                (max, a) => (a.endDate > max ? a.endDate : max),
                absences[0].endDate
            );
            nonWorkingDates = await getNonWorkingDays(organizationId, minStart, maxEnd);
        }

        const data: IAbsenceItem[] = absences.map((a) => ({
            id: a._id.toString(),
            employee: a.employee.toString(),
            employeeName: a.employeeName,
            employeeEmail: a.employeeEmail,
            departmentName: a.departmentName,
            startDate: a.startDate,
            endDate: a.endDate,
            daysCount: countWorkingDays(a.startDate, a.endDate, nonWorkingDates),
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
