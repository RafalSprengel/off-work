import mongoose, { type Document, type Model, Schema } from "mongoose";
import type { IDepartment } from "@/types/department";

export interface IDepartmentDocument
  extends Omit<IDepartment, "_id" | "organization" | "managers">,
  Document {
  managers: mongoose.Types.ObjectId[];
  organization: string; // Better Auth organization id
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartmentDocument>(
  {
    name: {
      type: String,
      required: [true, "Department name is required"],
      trim: true,
    },
    managers: [
      {
        type: Schema.Types.ObjectId,
        ref: "Employee",
      },
    ],
    organization: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    collation: {
      locale: "en",
      strength: 2,
    },
  },
);

DepartmentSchema.index(
  { name: 1, organization: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

DepartmentSchema.index({ organization: 1 });

const Department: Model<IDepartmentDocument> =
  (mongoose.models.Department as Model<IDepartmentDocument>) ||
  mongoose.model<IDepartmentDocument>("Department", DepartmentSchema);

export default Department;