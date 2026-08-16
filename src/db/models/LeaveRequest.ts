import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ILeaveRequest extends Document {
  employee: mongoose.Types.ObjectId | string;
  startDate: string;
  endDate: string;
  startHalfDay: boolean;
  endHalfDay: boolean;
  daysRequested: number;
  status: "pending" | "approved" | "rejected";
  type: "annual" | "sick" | "unpaid" | "other";
  comment?: string;
  organizationId: mongoose.Types.ObjectId;
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
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    startDate: {  // Format: 'YYY-MM-DD'
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"],
    },
    endDate: { // Format: 'YYY-MM-DD'
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"],
    },
    startHalfDay: {
      type: Boolean,
      default: false,
    },
    endHalfDay: {
      type: Boolean,
      default: false,
    },
    daysRequested: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    type: {
      type: String,
      enum: ["annual", "sick", "unpaid", "other"],
      default: "annual",
    },
    comment: {
      type: String,
      trim: true,
      default: "",
    },
  },
  { timestamps: true },
);

LeaveRequestSchema.index({ employee: 1, startDate: 1, endDate: 1 });
LeaveRequestSchema.index({ organizationId: 1 });

const LeaveRequest: Model<ILeaveRequest> =
  (mongoose.models.LeaveRequest as Model<ILeaveRequest>) ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);

export default LeaveRequest;