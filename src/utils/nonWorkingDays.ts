import dbConnect from "@/db/connection";
import ClosureDay from "@/db/models/ClosureDay";

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