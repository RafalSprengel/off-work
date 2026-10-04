import type { AbsenceType } from "@/db/models/Absence";

export interface IAbsenceItem {
    id: string;
    employee: string;
    employeeName?: string;
    employeeEmail?: string;
    departmentName?: string;
    startDate: string;
    endDate: string;
    /**
     * Liczba dni pracujacych w okresie - wartosc pochodna, liczona przy odczycie
     * z aktualnych dni nieroboczych (nie jest zapisywana w bazie).
     */
    daysCount: number;
    type: AbsenceType;
    note?: string;
    createdBy: string;
    createdAt: string;
}

export type ICreateAbsenceInput = {
    employee: string;
    startDate: string;
    endDate: string;
    type: AbsenceType;
    note?: string;
};

export type GetAbsencesResult =
    | { success: true; data: IAbsenceItem[]; error: null }
    | { success: false; data: []; error: string };

export type CreateAbsenceResult =
    | { success: true; data: IAbsenceItem; error: null }
    | { success: false; data: null; error: string };
