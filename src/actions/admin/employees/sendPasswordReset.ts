"use server";

import { headers } from "next/headers";
import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import { getAuth } from "@/lib/auth";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function sendPasswordReset(
  employeeId: string,
): Promise<{ success: boolean; error?: string }> {
  try {
    await dbConnect();
    const organizationId = await getOrganizationId();

    const employee = await Employee.findOne({
      _id: employeeId,
      organizationId,
    });

    if (!employee) {
      return { success: false, error: "Employee not found or access denied." };
    }

    const auth = await getAuth();
    const reqHeaders = await headers();

    // Build a proper Request object so Better Auth can resolve baseURL
    // from the host header and pass it through origin checks.
    const baseUrl = process.env.BETTER_AUTH_URL ?? "http://localhost:3000";
    const requestUrl = `${baseUrl}/api/auth/request-password-reset`;

    const redirectTo = `${baseUrl}/reset-password`;

    const request = new Request(requestUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Origin: baseUrl,
        Referer: `${baseUrl}/team/employees`,
        Host: new URL(baseUrl).host,
        Cookie: reqHeaders.get("cookie") || "",
      },
      body: JSON.stringify({
        email: employee.email,
        redirectTo,
      }),
    });

    await auth.api.requestPasswordReset({
      body: {
        email: employee.email,
        redirectTo,
      },
      headers: request.headers,
      request,
    });

    console.log(
      `[sendPasswordReset] Password reset email sent to ${employee.email}`,
    );

    return { success: true };
  } catch (error: any) {
    console.error("[sendPasswordReset] Error:", error);
    return {
      success: false,
      error:
        error instanceof Error
          ? error.message
          : "Failed to send password reset email",
    };
  }
}
