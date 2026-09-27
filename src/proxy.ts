// src/proxy.ts
import { NextRequest, NextResponse } from "next/server";
import { getCachedSession } from "@/lib/session";

export async function proxy(request: NextRequest) {
    const session = await getCachedSession();

    if (!session) {
        return NextResponse.redirect(new URL("/sign-in", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/me/:path*", "/team/:path*"],
};