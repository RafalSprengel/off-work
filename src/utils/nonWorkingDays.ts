import dbConnect from "@/db/connection";
import ClosureDay from "@/db/models/ClosureDay";
import { countWorkingDays } from "@/utils/workingDays";

/**
 * Pobiera wszystkie dni nierobocze (bank holidays + factory closures)
 * dla organizacji w podanym zakresie dat.
 * Zwraca Set dat w formacie YYYY-MM-DD.
 */
export async function getNonWorkingDays(
    organizationId: string,
    startDate: string, // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
): Promise<Set<string>> {
    await dbConnect();

    const closureDays = await ClosureDay.find({
        organizationId,
        enabled: true,
        type: { $in: ["bank_holiday", "company_closure"] },
        date: { $gte: startDate, $lte: endDate },
    })
        .select("date")
        .lean();

    return new Set(closureDays.map((day) => day.date));
}

/**
 * Zwraca liczbe dni pracujacych w zakresie, odliczajac weekendy
 * oraz dni nierobocze organizacji (bank holidays + factory closures).
 * Jedno miejsce, w ktorym dane z bazy sa laczone z regula dnia pracujacego.
 */
export async function countWorkingDaysForOrg(
    organizationId: string,
    startDate: string, // YYYY-MM-DD
    endDate: string // YYYY-MM-DD
): Promise<number> {
    const nonWorkingDays = await getNonWorkingDays(organizationId, startDate, endDate);
    return countWorkingDays(startDate, endDate, nonWorkingDays);
}