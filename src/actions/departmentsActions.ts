"use server";

import dbConnect from "@/db/connection";
import Department from "@/db/models/Departments";
import { revalidatePath } from "next/cache";
import type { ICreateDepartmentInput, IDepartment } from "@/types/department";
import { getOrganizationId } from "@/utils/getOrganizationId";

export async function getDepartments(): Promise<{ success: boolean, data: IDepartment[], error: string | null }> {
  try {
    await dbConnect();
    const organizationId = await getOrganizationId();
    const rawDepartments = await Department.find({ organizationId: organizationId }).select("_id name manager organizationId").lean();

    const departments: IDepartment[] = rawDepartments.map((dept: any) => ({
      _id: dept._id.toString(),
      name: dept.name,
      manager: dept.manager,
      organizationId: dept.organizationId.toString(),
    }));

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
      ...newDepartment,
      organizationId,
    });
    revalidatePath("/departments");

    return {
      success: true,
      data: {
        _id: department._id.toString(),
        name: department.name,
        manager: department.manager,
        organizationId: department.organizationId.toString(),
      },
    };
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

export async function updateDepartment(updatedDepartment: IDepartment) {
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
      { _id: updatedDepartment._id, organizationId },
      updatedDepartment,
      { new: true }
    );

    if (!department) {
      return {
        success: false,
        error: "Department not found or access denied.",
      };
    }

    revalidatePath("/departments", "page");

    return {
      success: true,
      data: {
        _id: department?._id.toString(),
        name: department?.name,
        manager: department?.manager,
        organizationId: department?.organizationId.toString(),
      },
    };
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
    const result = await Department.findOneAndDelete({ _id, organizationId });

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