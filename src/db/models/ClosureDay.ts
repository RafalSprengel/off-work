import mongoose, { type Document, type Model, Schema } from "mongoose";

export type ClosureDayType = "bank_holiday" | "company_closure" | "blackout_period";
export type UkBankHolidayRegion = "england-and-wales" | "scotland" | "northern-ireland";

export interface IClosureDay extends Document {
  date: string;
  title: string;
  type: ClosureDayType;
  region: UkBankHolidayRegion | null;
  batchLabel: string | null;
  enabled: boolean;
  isCustom: boolean;
  organizationId: string; // Better Auth organization id
  createdAt: Date;
  updatedAt: Date;
}

const ClosureDaySchema = new Schema<IClosureDay>(
  {
    date: {
      type: String,
      required: true,
      match: [/^\d{4}-\d{2}-\d{2}$/, "Invalid date format, expected YYYY-MM-DD"],
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    type: {
      type: String,
      enum: ["bank_holiday", "company_closure", "blackout_period"],
      default: "bank_holiday",
    },
    region: {
      type: String,
      enum: ["england-and-wales", "scotland", "northern-ireland", null],
      default: null,
    },
    batchLabel: {
      type: String,
      default: null,
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    isCustom: {
      type: Boolean,
      default: false,
    },
    organizationId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

ClosureDaySchema.index({ organizationId: 1, type: 1, date: 1 }, { unique: true });
ClosureDaySchema.index({ organizationId: 1, enabled: 1 });

const ClosureDay: Model<IClosureDay> =
  (mongoose.models.ClosureDay as Model<IClosureDay>) ||
  mongoose.model<IClosureDay>("ClosureDay", ClosureDaySchema);

export default ClosureDay;