import mongoose, { type Document, type Model, Schema } from "mongoose";
import type { IDepartment } from "@/types/department";

export interface IDepartmentDocument
  extends Omit<IDepartment, "_id" | "organizationId">,
  Document {
  organizationId: mongoose.Types.ObjectId;
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
    manager: {
      type: String,
      trim: true,
    },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
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
  { name: 1, organizationId: 1 },
  {
    unique: true,
    collation: { locale: "en", strength: 2 },
  },
);

DepartmentSchema.index({ organizationId: 1 });

const Department: Model<IDepartmentDocument> =
  (mongoose.models.Department as Model<IDepartmentDocument>) ||
  mongoose.model<IDepartmentDocument>("Department", DepartmentSchema);

export default Department;