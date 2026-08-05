"use server";

import dbConnect from "@/db/connection";
import Department from "@/db/models/Departments";
import { revalidatePath } from "next/cache";
import type { ICreateDepartmentInput, IEditDepartmentInput, IDepartment } from "@/types/department";

export async function createDepartment(newDepartment: ICreateDepartmentInput) {
  if (!newDepartment.name || newDepartment.name.trim().length < 2) {
    return {
      success: false,
      error: "Department name must be at least 2 characters long.",
    };
  }

  try {
    await dbConnect();
    const department = await Department.create(newDepartment);
    revalidatePath("/departments");

    return {
      success: true,
      data: {
        _id: department._id.toString(),
        name: department.name,
        manager: department.manager,
        createdAt: department.createdAt.toISOString(),
        updatedAt: department.updatedAt.toISOString(),
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

export async function deleteDepartment(_id: string) {
  try {
    await dbConnect();
    await Department.findByIdAndDelete(_id);
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

export async function getDepartments(): Promise<{ success: boolean, data: IDepartment[], error: string | null }> {
  try {
    await dbConnect();
    const rawDepartments = await Department.find({}).select("_id name manager").lean();

    const departments: IDepartment[] = rawDepartments.map((dept: any) => ({
      ...dept,
      _id: dept._id.toString()
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

export async function updateDepartment(updatedDepartment: IEditDepartmentInput) {
  if (!updatedDepartment.name || updatedDepartment.name.trim().length < 2) {
    return {
      success: false,
      error: "Department name must be at least 2 characters long.",
    };
  }

  try {
    await dbConnect();
    const department = await Department.findByIdAndUpdate(updatedDepartment._id, updatedDepartment, { new: true });
    revalidatePath("/departments", "page");

    return {
      success: true,
      data: {
        _id: department?._id.toString(),
        name: department?.name,
        manager: department?.manager,
        createdAt: department?.createdAt.toISOString(),
        updatedAt: department?.updatedAt.toISOString(),
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