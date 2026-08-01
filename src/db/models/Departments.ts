import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IDepartment extends Document {
    name: string;
    createdAt: Date;
    updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
    {
        name: {
            type: String,
            required: [true, 'Department name is required'],
            trim: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

const Department: Model<IDepartment> =
    (mongoose.models.Department as Model<IDepartment>) ||
    mongoose.model<IDepartment>('Department', DepartmentSchema);

export default Department;