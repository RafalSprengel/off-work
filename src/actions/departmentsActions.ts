"use server";

import mongoose from "mongoose";
import dbConnect from "@/db/connection";
import Department from "@/db/models/Department";
import Employee from "@/db/models/Employee";
import { revalidatePath } from "next/cache";
import type { ICreateDepartmentInput, IDepartment, IUpdateDepartmentInput } from "@/types/department";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function getDepartments(): Promise<{ success: boolean, data: IDepartment[], error: string | null }> {
  try {
    await dbConnect();
    const organizationId = await getOrganizationId();

    const rawDepartments = await Department.aggregate([
      { $match: { organization: new mongoose.Types.ObjectId(organizationId) } },
      {
        $lookup: {
          from: "employees",
          localField: "managers",
          foreignField: "_id",
          pipeline: [
            { $project: { firstName: 1, lastName: 1, _id: 1 } },
          ],
          as: "managers",
        },
      },
      { $project: { _id: 1, name: 1, managers: 1, organization: 1 } },
    ]);

    const departments: IDepartment[] = JSON.parse(JSON.stringify(rawDepartments));

    const departmentObjectIds = departments.map((d) => new mongoose.Types.ObjectId(d._id));

    const employeeCounts = await Employee.aggregate([
      {
        $match: {
          department: { $in: departmentObjectIds },
          status: { $ne: "inactive" }
        }
      },
      { $group: { _id: "$department", count: { $sum: 1 } } },
    ]);

    const countMap = new Map(
      employeeCounts.map((item) => [String(item._id), item.count])
    );

    for (const dept of departments) {
      dept.employeeCount = countMap.get(String(dept._id)) ?? 0;
    }

    return {
      success: true,
      data: departments,
      error: null,
    };
  } catch (error: any) {
    console.error("Error fetching departments:", error);

    return {
      success: false,
      data: [],
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function createDepartment(newDepartment: ICreateDepartmentInput) {
  if (!newDepartment.name || newDepartment.name.trim().length < 2) {
    return {
      success: false,
      error: "Department name must be at least 2 characters long.",
    };
  }

  try {
    await dbConnect();
    const organizationId = await getOrganizationId();
    const department = await Department.create({
      name: newDepartment.name,
      managers: newDepartment.managerIds ?? [],
      organization: organizationId,
    });
    revalidatePath("/departments");

    return { success: true };
  } catch (error: any) {
    console.error("Error creating department:", error);

    if (error.code === 11000) {
      return {
        success: false,
        error: "A department with this name already exists.",
      };
    }

    if (error.name === "ValidationError") {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function updateDepartment(updatedDepartment: IUpdateDepartmentInput) {
  if (!updatedDepartment.name || updatedDepartment.name.trim().length < 2) {
    return {
      success: false,
      error: "Department name must be at least 2 characters long.",
    };
  }

  try {
    await dbConnect();
    const organizationId = await getOrganizationId();
    const department = await Department.findOneAndUpdate(
      { _id: updatedDepartment._id, organization: organizationId },
      { name: updatedDepartment.name, managers: updatedDepartment.managerIds ?? [] },
      { new: true }
    );

    if (!department) {
      return {
        success: false,
        error: "Department not found or access denied.",
      };
    }

    revalidatePath("/departments", "page");

    return { success: true };
  } catch (error: any) {
    console.error("Error updating department:", error);

    if (error.code === 11000) {
      return {
        success: false,
        error: "A department with this name already exists.",
      };
    }

    if (error.name === "ValidationError") {
      return {
        success: false,
        error: error.message,
      };
    }

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}

export async function deleteDepartment(_id: string) {
  try {
    await dbConnect();
    const organizationId = await getOrganizationId();
    const result = await Department.findOneAndDelete({ _id, organization: organizationId });

    if (!result) {
      return {
        success: false,
        error: "Department not found or access denied.",
      };
    }

    revalidatePath("/departments", "page");

    return {
      success: true,
      error: null,
    };
  } catch (error: any) {
    console.error("Error deleting department:", error);

    return {
      success: false,
      error: error instanceof Error ? error.message : "An error occurred",
    };
  }
}