"use server";

import dbConnect from "@/db/connection";
import OrganizationSettings from "@/db/models/OrganizationSettings";
import { getOrganizationId } from "@/utils/getOrganizationId";
import { revalidatePath } from "next/cache";
import type { IOrgSettings, UpdateOrgSettingsResult } from "@/types/orgSettings";

export async function updateOrgSettings(
    data: Partial<IOrgSettings>
): Promise<UpdateOrgSettingsResult> {
    try {
        await dbConnect();
        const organizationId = await getOrganizationId();

        const doc = await OrganizationSettings.findOneAndUpdate(
            { organizationId },
            { $set: { ...data, organizationId } },
            { upsert: true, new: true, runValidators: true }
        );

        revalidatePath("/team/settings");

        return {
            success: true,
            data: {
                companyName: doc.companyName,
                timezone: doc.timezone,
                country: doc.country,
                address: doc.address ?? "",
                website: doc.website ?? "",
                holidayYearStart: doc.holidayYearStart,
                holidayYearEnd: doc.holidayYearEnd,
                defaultAnnualLeaveDays: doc.defaultAnnualLeaveDays,
                allowCarryOver: doc.allowCarryOver,
                maxCarryOverDays: doc.maxCarryOverDays,
                autoApproveSickLeave: doc.autoApproveSickLeave,
            },
            error: null,
        };
    } catch (error) {
        console.error("Error updating org settings:", error);
        return {
            success: false,
            data: null,
            error: error instanceof Error ? error.message : "Failed to save settings",
        };
    }
}
