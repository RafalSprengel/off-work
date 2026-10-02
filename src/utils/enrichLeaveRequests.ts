import dbConnect from "@/db/connection";
import Absence from "@/db/models/Absence";
import { getNonWorkingDays } from "@/utils/nonWorkingDays";
import { countAbsenceOverlapDays, type DateRange } from "@/utils/leaveBalance";

interface EnrichableRequest {
    employee?: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    type: string;
}

export type WithChargedDays<T> = T & {
    /** Dni faktycznie odliczane od puli urlopu (po odjeciu dni pokrytych absencja). */
    chargedDays: number;
    /** Dni robocze urlopu pokryte absencja. */
    absenceDays: number;
};

/**
 * Dodaje do wnioskow pola chargedDays i absenceDays na podstawie kolekcji Absence.
 * Wnioski sa przekazywane po JSON.parse, wiec `employee` jest stringiem.
 * Tylko wnioski typu "annual" sa korygowane.
 */
export async function addChargedDays<T extends EnrichableRequest>(
    requests: T[],
    organizationId: string
): Promise<WithChargedDays<T>[]> {
    const annual = requests.filter((r) => r.type === "annual" && r.employee);

    if (annual.length === 0) {
        return requests.map((r) => ({ ...r, chargedDays: r.daysRequested, absenceDays: 0 }));
    }

    await dbConnect();

    const employeeIds = Array.from(new Set(annual.map((r) => String(r.employee))));
    const minStart = annual.reduce((min, r) => (r.startDate < min ? r.startDate : min), annual[0].startDate);
    const maxEnd = annual.reduce((max, r) => (r.endDate > max ? r.endDate : max), annual[0].endDate);

    const [absenceDocs, nonWorkingDays] = await Promise.all([
        Absence.find({
            organizationId,
            employee: { $in: employeeIds },
            startDate: { $lte: maxEnd },
            endDate: { $gte: minStart },
        })
            .select("employee startDate endDate")
            .lean(),
        getNonWorkingDays(organizationId, minStart, maxEnd),
    ]);

    const absencesByEmployee = new Map<string, DateRange[]>();
    for (const a of absenceDocs) {
        const key = a.employee.toString();
        const list = absencesByEmployee.get(key) ?? [];
        list.push({ startDate: a.startDate, endDate: a.endDate });
        absencesByEmployee.set(key, list);
    }

    return requests.map((r) => {
        if (r.type !== "annual" || !r.employee) {
            return { ...r, chargedDays: r.daysRequested, absenceDays: 0 };
        }
        const absences = absencesByEmployee.get(String(r.employee)) ?? [];
        const absenceDays = countAbsenceOverlapDays(r, absences, nonWorkingDays);
        return {
            ...r,
            chargedDays: Math.max(r.daysRequested - absenceDays, 0),
            absenceDays,
        };
    });
}
