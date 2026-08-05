export interface IEditDepartmentInput {
  _id: string;
  name: string;
  manager?: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  manager?: string;
  createdAt: string;
  updatedAt: string;
}

export type ICreateDepartmentInput = Pick<IDepartment, "name" | "manager">;
