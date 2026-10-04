import mongoose, { type Document, type Model, Schema } from "mongoose";

export type AbsenceType = "sick" | "unauthorised" | "other";

export interface IAbsence extends Document {
    employee: mongoose.Types.ObjectId | string;
    startDate: string;
    endDate: string;
    type: AbsenceType;
    note?: string;
    organizationId: string;
    createdBy: mongoose.Types.ObjectId | string;
    employeeName?: string;
    employeeEmail?: string;
    departmentName?: string;
    createdAt: Date;
    updatedAt: Date;
}

const AbsenceSchema = new Schema<IAbsence>(
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
        type: {
            type: String,
            enum: ["sick", "unauthorised", "other"],
            default: "sick",
        },
        note: {
            type: String,
            trim: true,
            default: "",
        },
        createdBy: {
            type: Schema.Types.ObjectId,
            ref: "Employee",
            required: true,
        },
        employeeName: { type: String },
        employeeEmail: { type: String },
        departmentName: { type: String },
    },
    { timestamps: true }
);

AbsenceSchema.index({ organizationId: 1, employee: 1, startDate: 1 });
AbsenceSchema.index({ organizationId: 1, startDate: 1 });

const Absence: Model<IAbsence> =
    (mongoose.models.Absence as Model<IAbsence>) ||
    mongoose.model<IAbsence>("Absence", AbsenceSchema);

export default Absence;
