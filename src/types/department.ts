export interface IManagerData {
  _id: string;
  firstName: string;
  lastName: string;
  email?: string;
}

export interface IDepartment {
  _id: string;
  name: string;
  managers?: IManagerData[];
  organization: string;
  employeeCount?: number;
}

export type ICreateDepartmentInput = Pick<IDepartment, "name"> & {
  managerIds?: string[];
};

export type IUpdateDepartmentInput = {
  _id: string;
  name: string;
  managerIds?: string[];
};