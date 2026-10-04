"use server";

import dbConnect from "@/db/connection";
import Absence from "@/db/models/Absence";
import Employee from "@/db/models/Employee";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { countWorkingDaysForOrg } from "@/utils/nonWorkingDays";
import { getCachedSession } from "@/lib/session";
import { revalidatePath } from "next/cache";
import type { ICreateAbsenceInput, IAbsenceItem, CreateAbsenceResult } from "@/types/absence";
import mongoose from "mongoose";

export async function createAbsence(data: ICreateAbsenceInput): Promise<CreateAbsenceResult> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const session = await getCachedSession();
        if (!session?.user) throw new Error("Unauthorized");

        const creator = await Employee.findOne({
            userId: session.user.id,
            organizationId,
        }).lean();
        if (!creator) throw new Error("Employee profile not found");

        const targetEmployee = await Employee.findOne({
            _id: new mongoose.Types.ObjectId(data.employee),
            organizationId,
        })
            .populate("department")
            .lean();
        if (!targetEmployee) throw new Error("Target employee not found");

        const dept = targetEmployee.department as { name?: string } | null;

        // Absencje wystawiamy tylko na dni pracujace - odrzucamy weekendy i dni nierobocze.
        // daysCount liczymy po stronie serwera, zeby nie ufac wartosci z klienta.
        const daysCount = await countWorkingDaysForOrg(
            organizationId,
            data.startDate,
            data.endDate
        );

        if (daysCount <= 0) {
            return {
                success: false,
                data: null,
                error:
                    "Selected range contains no working days. Weekends and non-working days cannot be recorded as absence.",
            };
        }

        const absence = await Absence.create({
            organizationId,
            employee: new mongoose.Types.ObjectId(data.employee),
            startDate: data.startDate,
            endDate: data.endDate,
            type: data.type,
            note: data.note ?? "",
            createdBy: creator._id,
            employeeName: `${targetEmployee.firstName} ${targetEmployee.lastName}`,
            employeeEmail: targetEmployee.email,
            departmentName: dept?.name ?? "",
        });

        revalidatePath("/team/absences");
        revalidatePath("/me");
        revalidatePath("/team/employees", "layout");
        revalidatePath("/team/leave-requests", "layout");
        revalidatePath("/team/calendar");

        const item: IAbsenceItem = {
            id: absence._id.toString(),
            employee: data.employee,
            employeeName: `${targetEmployee.firstName} ${targetEmployee.lastName}`,
            employeeEmail: targetEmployee.email,
            departmentName: dept?.name ?? "",
            startDate: absence.startDate,
            endDate: absence.endDate,
            daysCount,
            type: absence.type,
            note: absence.note,
            createdBy: creator._id.toString(),
            createdAt: absence.createdAt.toISOString(),
        };

        return { success: true, data: item, error: null };
    } catch (error) {
        console.error("Error creating absence:", error);
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : "Failed to create absence",
        };
    }
}
