import type { IDepartment } from "@/types/department"

export interface IEmployee {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    role: string;
    department?: IDepartment | string;
    proposedAnnualLeave: number;
    employmentDate: string;
    managerId?: string;
    organizationId?: string;
    status: "active" | "inactive" | "invited";
}

export type ICreateEmployeeInput = Omit<IEmployee, "_id" | "status" | "organizationId" | "department"> & {
    department: string;
};

export type IManager = {
    _id: string;
    firstName: string;
    lastName: string;
};