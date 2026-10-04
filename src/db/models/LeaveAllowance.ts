import mongoose, { type Document, type Model, Schema } from "mongoose";

import {
    LEAVE_ALLOWANCE_TYPES,
    type LeaveAllowanceType,
} from "@/constants/leaveAllowanceTypes";

export { LEAVE_ALLOWANCE_TYPES, type LeaveAllowanceType };

export interface ILeaveAllowance extends Document {
    organizationId: string;
    employee: mongoose.Types.ObjectId | string;
    type: LeaveAllowanceType;
    days: number;
    createdAt: Date;
    updatedAt: Date;
}

const LeaveAllowanceSchema = new Schema<ILeaveAllowance>(
    {
        organizationId: {
            type: String,
            required: true,
        },
        employee: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        type: {
            type: String,
            enum: [...LEAVE_ALLOWANCE_TYPES],
            required: true,
        },
        days: {
            type: Number,
            required: true,
            min: 0,
            default: 0,
        },
    },
    { timestamps: true }
);

LeaveAllowanceSchema.index(
    { organizationId: 1, employee: 1, type: 1 },
    { unique: true }
);

const LeaveAllowance: Model<ILeaveAllowance> =
    (mongoose.models.LeaveAllowance as Model<ILeaveAllowance>) ||
    mongoose.model<ILeaveAllowance>("LeaveAllowance", LeaveAllowanceSchema);

export default LeaveAllowance;
