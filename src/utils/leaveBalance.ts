import dayjs from "dayjs";
import { isWorkingDay } from "@/utils/workingDays";

/**
 * Czyste funkcje (bez dostepu do bazy) do liczenia salda urlopu z uwzglednieniem absencji.
 * Absencja (sick / unauthorised / other) ma wyzszy priorytet niz urlop - dni robocze
 * urlopu pokryte absencja nie sa odliczane od puli urlopowej.
 * Polowki dni sa ignorowane: absencja pokrywa cale dni.
 */

export interface DateRange {
    startDate: string; // YYYY-MM-DD
    endDate: string; // YYYY-MM-DD
}

interface ChargeableRequest {
    status: string;
    type: string;
    daysRequested: number;
    chargedDays?: number;
}

/**
 * Liczy dni robocze z zakresu urlopu, ktore pokrywaja sie z dowolna absencja.
 * Weekendy i dni nierobocze (bank holidays, company closures) nie sa liczone.
 */
export function countAbsenceOverlapDays(
    leave: DateRange,
    absences: DateRange[],
    nonWorkingDays: Set<string>
): number {
    if (absences.length === 0) return 0;

    const end = dayjs(leave.endDate, "YYYY-MM-DD");
    let current = dayjs(leave.startDate, "YYYY-MM-DD");
    let overlap = 0;

    while (!current.isAfter(end, "day")) {
        const formatted = current.format("YYYY-MM-DD");

        if (
            isWorkingDay(current, nonWorkingDays) &&
            absences.some((a) => a.startDate <= formatted && a.endDate >= formatted)
        ) {
            overlap++;
        }
        current = current.add(1, "day");
    }

    return overlap;
}

/** Dni faktycznie odliczane od puli (wniosek bez pola chargedDays = daysRequested). */
export function getChargedDays(request: Pick<ChargeableRequest, "daysRequested" | "chargedDays">): number {
    return request.chargedDays ?? request.daysRequested;
}

/**
 * Tekst do wyswietlenia liczby dni wniosku, np. "5" albo "5 (2 covered by absence)".
 * Adnotacja pojawia sie tylko, gdy czesc dni pokrywa absencja.
 */
export function formatRequestDays(
    request: Pick<ChargeableRequest, "daysRequested"> & { absenceDays?: number },
    suffix = ""
): string {
    const base = `${request.daysRequested}${suffix}`;
    return request.absenceDays && request.absenceDays > 0
        ? `${base} (${request.absenceDays} covered by absence)`
        : base;
}

/** Suma zuzytych dni urlopu rocznego: zatwierdzone wnioski "annual" pomniejszone o absencje. */
export function sumAnnualDaysUsed(requests: ChargeableRequest[]): number {
    return requests
        .filter((req) => req.status === "approved" && req.type === "annual")
        .reduce((sum, req) => sum + getChargedDays(req), 0);
}
