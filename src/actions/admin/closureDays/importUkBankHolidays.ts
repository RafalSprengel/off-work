"use server";

import dbConnect from "@/db/connection";
import ClosureDay, { type UkBankHolidayRegion } from "@/db/models/ClosureDay";
import { revalidatePath } from "next/cache";
import { getOrganizationId } from "@/utils/getOrganizationId";
import mongoose from "mongoose";

interface GovUkBankHolidayEvent {
    title: string;
    date: string;
    notes: string;
    bunting: boolean;
}

interface GovUkBankHolidaysResponse {
    "england-and-wales": { division: string; events: GovUkBankHolidayEvent[] };
    scotland: { division: string; events: GovUkBankHolidayEvent[] };
    "northern-ireland": { division: string; events: GovUkBankHolidayEvent[] };
}

export interface ImportUkBankHolidaysResult {
    success: boolean;
    imported: number;
    skipped: number;
    error: string | null;
}

export async function importUkBankHolidays(
    region: UkBankHolidayRegion
): Promise<ImportUkBankHolidaysResult> {
    try {
        const response = await fetch("https://www.gov.uk/bank-holidays.json", {
            next: { revalidate: 86400 },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch bank holidays from gov.uk");
        }

        const data: GovUkBankHolidaysResponse = await response.json();
        const events = data[region]?.events ?? [];

        if (events.length === 0) {
            return {
                success: false,
                imported: 0,
                skipped: 0,
                error: `No bank holiday data found for region "${region}".`,
            };
        }

        await dbConnect();
        const orgObjectId = new mongoose.Types.ObjectId(await getOrganizationId());

        const operations = events.map((event) => ({
            updateOne: {
                filter: {
                    organizationId: orgObjectId,
                    type: "bank_holiday" as const,
                    date: event.date,
                },
                update: {
                    $setOnInsert: {
                        organizationId: orgObjectId,
                        type: "bank_holiday" as const,
                        date: event.date,
                        title: event.title,
                        region,
                        enabled: true,
                        isCustom: false,
                        batchLabel: null,
                    },
                },
                upsert: true,
            },
        }));

        const result = await ClosureDay.bulkWrite(operations, { ordered: false });

        const imported = result.upsertedCount ?? 0;
        const skipped = events.length - imported;

        revalidatePath("/team/settings/holidays");

        return {
            success: true,
            imported,
            skipped,
            error: null,
        };
    } catch (error: unknown) {
        console.error("Error importing UK bank holidays:", error);
        return {
            success: false,
            imported: 0,
            skipped: 0,
            error: error instanceof Error ? error.message : "Failed to import bank holidays",
        };
    }
}