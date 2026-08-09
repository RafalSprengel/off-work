import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface ILeaveRequest extends Document {
  employee: mongoose.Types.ObjectId;
  dates: string[];
  daysRequested: number;
  status: "pending" | "approved" | "rejected";
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    employee: { type: Schema.Types.ObjectId, ref: "Employee", required: true },
    dates: [{ type: String, required: true }],
    daysRequested: { type: Number, required: true },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true },
);

LeaveRequestSchema.index({ employee: 1, dates: 1 });
LeaveRequestSchema.index({ organizationId: 1 });

const LeaveRequest: Model<ILeaveRequest> =
  (mongoose.models.LeaveRequest as Model<ILeaveRequest>) ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);

export default LeaveRequest;