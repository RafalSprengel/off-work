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
    approvedAt?: string | null;
    cancelledAt?: string | null;
    snapshot: {
        employeeName: string;
        employeeEmail: string;
        departmentName: string;
        managerName?: string;
        approvedByName?: string;
    };
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
    approvedAt?: string | null;
    cancelledAt?: string | null;
    snapshot: {
        employeeName: string;
        employeeEmail: string;
        departmentName: string;
        managerName?: string;
        approvedByName?: string;
    };
    createdAt: string;
    updatedAt: string;
}

export interface TeamLeaveRequestItem {
    _id: string;
    startDate: string;
    endDate: string;
    startHalfDay: boolean;
    endHalfDay: boolean;
    daysRequested: number;
    status: "pending" | "approved" | "rejected";
    type: "annual" | "sick" | "unpaid" | "other";
    snapshot: {
        employeeName: string;
        employeeEmail: string;
        departmentName: string;
    };
    createdAt: string;
    updatedAt: string;
}