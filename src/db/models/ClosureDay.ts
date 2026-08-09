import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IClosureDay extends Document {
  title: string;
  dates: Date[];
  type: "bank_holiday" | "company_closure" | "blackout_period";
  enabled: boolean;
  isCustom: boolean;
  organizationId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ClosureDaySchema = new Schema<IClosureDay>(
  {
    title: { type: String, required: true },
    dates: [{ type: Date, required: true }],
    type: {
      type: String,
      enum: ["bank_holiday", "company_closure", "blackout_period"],
      default: "bank_holiday",
    },
    enabled: { type: Boolean, default: true },
    isCustom: { type: Boolean, default: false },
    organizationId: {
      type: Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
    },
  },
  { timestamps: true },
);

ClosureDaySchema.index({ dates: 1, type: 1, enabled: 1 });
ClosureDaySchema.index({ organizationId: 1 });

const ClosureDay: Model<IClosureDay> =
  (mongoose.models.ClosureDay as Model<IClosureDay>) ||
  mongoose.model<IClosureDay>("ClosureDay", ClosureDaySchema);

export default ClosureDay;