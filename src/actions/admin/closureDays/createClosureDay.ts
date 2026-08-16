"use server";

import dbConnect from "@/db/connection";
import ClosureDay from "@/db/models/ClosureDay";
import { revalidatePath } from "next/cache";
import { getOrganizationId } from "@/utils/getOrganizationId";
import mongoose from "mongoose";
import dayjs from "dayjs";

export interface CreateClosureDayInput {
    date: string; // YYYY-MM-DD
    title: string;
}

export interface CreateClosureDayResult {
    success: boolean;
    error: string | null;
}

export async function createClosureDay(
    input: CreateClosureDayInput
): Promise<CreateClosureDayResult> {
    try {
        const { date, title } = input;

        if (!date || !title || title.trim().length === 0) {
            return { success: false, error: "Date and title are required." };
        }

        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            return { success: false, error: "Invalid date format. Expected YYYY-MM-DD." };
        }

        const closureDate = dayjs(date, "YYYY-MM-DD");
        if (!closureDate.isValid()) {
            return { success: false, error: "Invalid date." };
        }

        const today = dayjs().format("YYYY-MM-DD");
        if (date < today) {
            return { success: false, error: "Cannot add a closure day in the past." };
        }

        await dbConnect();
        const orgObjectId = new mongoose.Types.ObjectId(await getOrganizationId());

        const existing = await ClosureDay.findOne({
            organizationId: orgObjectId,
            date: date,
        });

        if (existing) {
            return {
                success: false,
                error: "A closure day already exists on this date.",
            };
        }

        await ClosureDay.create({
            organizationId: orgObjectId,
            date: date,
            title: title.trim(),
            type: "company_closure",
            region: null,
            batchLabel: null,
            enabled: true,
            isCustom: true,
        });

        revalidatePath("/team/settings/closures");

        return { success: true, error: null };
    } catch (error: unknown) {
        console.error("Error creating closure day:", error);
        return {
            success: false,
            error: error instanceof Error ? error.message : "Failed to create closure day",
        };
    }
}