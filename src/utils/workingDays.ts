import dayjs, { type Dayjs } from "dayjs";

/**
 * Czyste funkcje (bez dostepu do bazy) opisujace, kiedy pracownik powinien byc w pracy.
 * Jedno zrodlo prawdy dla logiki dnia pracujacego w calej aplikacji.
 */

export type DateLike = string | Date | Dayjs;

/**
 * JEDYNE miejsce definiujace tydzien pracy.
 * Zmiana polityki (np. soboty staja sie pracujace) = zmiana tej linii.
 * 0 = niedziela, 6 = sobota.
 */
const WEEKEND_DAYS: readonly number[] = [0, 6];

/** Weekend wg polityki tygodnia pracy (domyslnie sobota/niedziela). */
export function isWeekend(date: DateLike): boolean {
    return WEEKEND_DAYS.includes(dayjs(date).day());
}

/**
 * Atomowy predykat: czy w danym dniu pracownik powinien byc w pracy.
 * Dni nierobocze (bank holidays, company closures) przekazywane jako Set "YYYY-MM-DD".
 */
export function isWorkingDay(
    date: DateLike,
    nonWorkingDates: ReadonlySet<string> = new Set()
): boolean {
    return !isWeekend(date) && !nonWorkingDates.has(dayjs(date).format("YYYY-MM-DD"));
}

/**
 * Lista dni pracujacych w zakresie [start, end] wlacznie (format "YYYY-MM-DD").
 * Uzyteczna do kalendarzy oraz iteracji po dniach.
 */
export function getWorkingDays(
    start: DateLike,
    end: DateLike,
    nonWorkingDates: ReadonlySet<string> = new Set()
): string[] {
    const days: string[] = [];
    let current = dayjs(start);
    const last = dayjs(end);

    while (!current.isAfter(last, "day")) {
        if (isWorkingDay(current, nonWorkingDates)) {
            days.push(current.format("YYYY-MM-DD"));
        }
        current = current.add(1, "day");
    }

    return days;
}

/**
 * GLOWNA funkcja: ile dni pracownik powinien byc w pracy w podanym zakresie.
 * Odlicza weekendy oraz dni nierobocze.
 */
export function countWorkingDays(
    start: DateLike,
    end: DateLike,
    nonWorkingDates: ReadonlySet<string> = new Set()
): number {
    return getWorkingDays(start, end, nonWorkingDates).length;
}

/**
 * Liczba dni urlopu wniosku: dni robocze w zakresie minus polowki dni.
 * Wartosc pochodna - liczona z okresu + flag polowek + aktualnych dni nieroboczych.
 */
export function computeLeaveDaysRequested(
    startDate: DateLike,
    endDate: DateLike,
    startHalfDay = false,
    endHalfDay = false,
    nonWorkingDates: ReadonlySet<string> = new Set()
): number {
    let days = countWorkingDays(startDate, endDate, nonWorkingDates);
    if (startHalfDay) days -= 0.5;
    if (endHalfDay) days -= 0.5;
    return Math.max(days, 0);
}
