export interface IDepartment {
  _id: string;
  name: string;
  manager?: string;
  organizationId: string;
}

export type ICreateDepartmentInput = Pick<IDepartment, "name" | "manager" | "organizationId">;