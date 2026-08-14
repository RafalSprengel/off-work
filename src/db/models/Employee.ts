// src/db/models/Employee.ts
import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IEmployeeDocument extends Document {
    firstName: string;
    lastName: string;
    email: string;
    role: "Manager" | "Employee";
    department: mongoose.Types.ObjectId;
    annualLeaveDaysAllowance: number;
    employmentDate: Date;
    managerId?: mongoose.Types.ObjectId;
    organizationId?: mongoose.Types.ObjectId;
    status: "active" | "inactive" | "invited";
    createdAt: Date;
    updatedAt: Date;
}

const EmployeeSchema = new Schema<IEmployeeDocument>(
    {
        firstName: { type: String, required: true, trim: true },
        lastName: { type: String, required: true, trim: true },
        email: {
            type: String,
            required: true,
            lowercase: true,
            trim: true,
        },
        role: {
            type: String,
            enum: ["Manager", "Employee"],
            default: "Employee",
        },
        department: {
            type: Schema.Types.ObjectId,
            ref: "Department",
            required: true,
        },

        annualLeaveDaysAllowance: { type: Number, default: 24, min: 0 },
        employmentDate: { type: Date, required: true },
        managerId: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            default: null,
        },
        organizationId: {
            type: Schema.Types.ObjectId,
            ref: "Organization",
            default: null,
        },
        status: {
            type: String,
            enum: ["active", "inactive", "invited"],
            default: "invited",
        },
    },
    { timestamps: true }
);


EmployeeSchema.index({ email: 1 }, { unique: true });
EmployeeSchema.index({ department: 1, status: 1 });

const Employee: Model<IEmployeeDocument> =
    (mongoose.models.Employee as Model<IEmployeeDocument>) ||
    mongoose.model<IEmployeeDocument>("Employee", EmployeeSchema);

export default Employee;