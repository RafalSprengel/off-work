export interface LeaveRequest {
  id: string;
  type: string;
  startDate: string;
  endDate: string;
  days: number;
  status: "Pending" | "Approved" | "Rejected";
  reason: string;
}

export interface CreateLeaveRequestInput {
  startDate: string;
  endDate: string;
  comment?: string;
}

export interface CreateLeaveRequestParams {
  userId: string;
  startDate: string;
  endDate: string;
  startHalfDay?: boolean;
  endHalfDay?: boolean;
}

export interface MyLeaveRequestDetail {
  _id: string;
  startDate: string;
  endDate: string;
  daysRequested: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  type: "annual" | "sick" | "unpaid" | "other";
  comment?: string;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  cancelledAt?: string | null;
  employeeName?: string;
  employeeEmail?: string;
  departmentName?: string;
  managerName?: string;
  reviewedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface LeaveRequestDetail {
  _id: string;
  startDate: string;
  endDate: string;
  startHalfDay: boolean;
  endHalfDay: boolean;
  daysRequested: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  type: "annual" | "sick" | "unpaid" | "other";
  comment?: string;
  rejectionReason?: string | null;
  reviewedAt?: string | null;
  cancelledAt?: string | null;
  employeeName?: string;
  employeeEmail?: string;
  departmentName?: string;
  managerName?: string;
  reviewedByName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TeamLeaveRequestItem {
  _id: string;
  employee?: string;
  startDate: string;
  endDate: string;
  startHalfDay: boolean;
  endHalfDay: boolean;
  daysRequested: number;
  status: "pending" | "approved" | "rejected";
  type: "annual" | "sick" | "unpaid" | "other";
  comment?: string;
  rejectionReason?: string | null;
  employeeName?: string;
  employeeEmail?: string;
  departmentName?: string;
  createdAt: string;
  updatedAt: string;
}
