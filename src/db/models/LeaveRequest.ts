import mongoose, { Schema, Document, Model } from 'mongoose';

export interface ILeaveRequest extends Document {
  user: mongoose.Types.ObjectId;
  dates: Date[];
  daysRequested: number;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    dates: [{ type: Date, required: true }],
    daysRequested: { type: Number, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

LeaveRequestSchema.index({ user: 1, dates: 1 });

const LeaveRequest: Model<ILeaveRequest> =
  (mongoose.models.LeaveRequest as Model<ILeaveRequest>) ||
  mongoose.model<ILeaveRequest>('LeaveRequest', LeaveRequestSchema);

export default LeaveRequest;