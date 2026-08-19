import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ILeaveRequest extends Document {
  employee: mongoose.Types.ObjectId | string;
  startDate: string;
  endDate: string;
  startHalfDay: boolean;
  endHalfDay: boolean;
  daysRequested: number;
  status: "pending" | "approved" | "rejected" | "cancelled";
  type: "annual" | "sick" | "unpaid" | "other";
  comment?: string;
  rejectionReason?: string | null;
  coveringEmployee?: mongoose.Types.ObjectId | null;
  attachments?: string[];
  organizationId: mongoose.Types.ObjectId;
  createdBy: mongoose.Types.ObjectId | string;
  approvedBy?: mongoose.Types.ObjectId | string | null;
  approvedAt?: Date | null;
  cancelledAt?: Date | null;
  snapshot?: {
    employeeName?: string;
    employeeEmail?: string;
    departmentName?: string;
    managerName?: string;
    approvedByName?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    startDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"],
    },
    endDate: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"],
    },
    startHalfDay: { type: Boolean, default: false },
    endHalfDay: { type: Boolean, default: false },
    daysRequested: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["annual", "sick", "unpaid", "other"],
      default: "annual",
    },
    comment: { type: String, trim: true, default: "" },
    rejectionReason: { type: String, trim: true, default: null },
    coveringEmployee: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    attachments: { type: [String], default: [] },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },
    approvedBy: {
      type: Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
    approvedAt: { type: Date, default: null },
    cancelledAt: { type: Date, default: null },
    snapshot: {
      employeeName: { type: String },
      employeeEmail: { type: String },
      departmentName: { type: String },
      managerName: { type: String },
      approvedByName: { type: String },
    },
  },
  { timestamps: true }
);

LeaveRequestSchema.index({ employee: 1, startDate: 1, endDate: 1 });
LeaveRequestSchema.index({ organizationId: 1, status: 1 });
LeaveRequestSchema.index({ createdBy: 1 });

const LeaveRequest: Model<ILeaveRequest> =
  (mongoose.models.LeaveRequest as Model<ILeaveRequest>) ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);

export default LeaveRequest;