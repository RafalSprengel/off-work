"use server";

import dbConnect from "@/db/connection";
import Employee from "@/db/models/Employee";
import type { IEmployee } from "@/types/employees";
import { getOrganizationId } from "@/utils/getOrganizationId";

export interface EmployeeDetail extends IEmployee {
  managerName?: string;
}

export async function getEmployeeById(
  id: string,
): Promise<{ success: boolean; data?: EmployeeDetail; error?: string }> {
  try {
    await dbConnect();
    const organizationId = await getOrganizationId();

    const raw = await Employee.findOne({ _id: id, organizationId })
      .populate("department", "name manager")
      .lean();

    if (!raw) {
      return { success: false, error: "Employee not found" };
    }

    const data = JSON.parse(JSON.stringify(raw)) as EmployeeDetail;

    // Resolve the employee's manager name (if any) from the referenced employee.
    if (data.managerId) {
      const manager = await Employee.findById(data.managerId)
        .select("firstName lastName")
        .lean();
      if (manager) {
        data.managerName = `${manager.firstName} ${manager.lastName}`;
      }
    }

    return { success: true, data };
  } catch (error) {
    console.error("Error fetching employee by id:", error);
    return {
      success: false,
      error:
        error instanceof Error ? error.message : "Failed to fetch employee",
    };
  }
}
