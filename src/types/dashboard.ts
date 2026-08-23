export interface TeamDashboardData {
    totalEmployees: number;
    activeOnLeave: number;
    pendingApprovals: number;
    onLeaveThisWeek: number;
    todayAbsences: PendingRequestItem[];
    pendingRequests: PendingRequestItem[];
    departmentOverview: DepartmentOverviewItem[];
}

export interface PendingRequestItem {
    _id: string;
    startDate: string;
    endDate: string;
    daysRequested: number;
    type: "annual" | "sick" | "unpaid" | "other";
    snapshot: {
        employeeName: string;
        employeeEmail: string;
        departmentName: string;
    };
    createdAt: string;
}

export interface DepartmentOverviewItem {
    name: string;
    count: number;
    onLeave: number;
}