// This API endpoint is no longer used.
// Pending organization setup is now handled via the /onboarding page.
// See src/app/(app)/onboarding/page.tsx

import { NextResponse } from "next/server";

export async function POST() {
    return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}

export async function GET() {
    return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}

export async function DELETE() {
    return NextResponse.json({ error: "Deprecated" }, { status: 410 });
}