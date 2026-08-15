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