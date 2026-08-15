"use server";

interface GovUkBankHolidayEvent {
    title: string;
    date: string;
    notes: string;
    bunting: boolean;
}

interface GovUkBankHolidaysResponse {
    "england-and-wales": {
        division: string;
        events: GovUkBankHolidayEvent[];
    };
    scotland: {
        division: string;
        events: GovUkBankHolidayEvent[];
    };
    "northern-ireland": {
        division: string;
        events: GovUkBankHolidayEvent[];
    };
}

export async function getUkBankHolidays(): Promise<{ success: boolean; data: string[]; error: string | null }> {
    try {
        const response = await fetch("https://www.gov.uk/bank-holidays.json", {
            next: { revalidate: 86400 },
        });

        if (!response.ok) {
            throw new Error("Failed to fetch bank holidays from gov.uk");
        }

        const data: GovUkBankHolidaysResponse = await response.json();

        const englandAndWalesEvents = data["england-and-wales"]?.events || [];
        const holidayDates = englandAndWalesEvents.map((event) => event.date);

        return {
            success: true,
            data: holidayDates,
            error: null,
        };
    } catch (error: unknown) {
        console.error("Error fetching UK bank holidays:", error);
        return {
            success: false,
            data: [],
            error: error instanceof Error ? error.message : "Failed to load bank holidays",
        };
    }
}