import { getAuth } from "@/lib/auth";
import { NextRequest } from "next/server";

/**
 * Handles the email verification link clicked by the user.
 *
 * Better Auth's internal endpoints are mounted under its base path
 * (default: /api/auth). Since this route receives the request at
 * /verify-email, we rewrite the URL so Better Auth can correctly
 * route it to its internal /verify-email endpoint.
 *
 * On success Better Auth will:
 *  1. Verify the JWT token
 *  2. Mark the user's email as verified
 *  3. Call afterEmailVerification hook
 *  4. Auto-sign-in (creates a session and sets the cookie)
 *  5. Redirect to the callbackURL (/verify-email/callback)
 */
export async function GET(request: NextRequest) {
    const auth = await getAuth();

    // Better Auth's handler needs the path under its base path
    // so it can strip the prefix and match internal endpoints.
    const url = new URL(request.url);
    url.pathname = "/api/auth/verify-email";

    const proxiedRequest = new NextRequest(url.toString(), request);

    return auth.handler(proxiedRequest);
}