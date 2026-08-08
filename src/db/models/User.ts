import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  firstName: string;
  lastName: string;
  email: string;
  emailVerified: boolean;
  image?: string;
  department: mongoose.Types.ObjectId;
  role: string;
  organizationId?: mongoose.Types.ObjectId;
  managerId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    emailVerified: { type: Boolean, default: false },
    image: { type: String, default: null },
    department: { type: Schema.Types.ObjectId, ref: "Department", required: true },
    role: {
      type: String,
      enum: ["Manager", "Employee"],
      default: "Employee",
      required: true
    },
    organizationId: { type: Schema.Types.ObjectId, ref: "Organization", default: null },
    managerId: { type: Schema.Types.ObjectId, ref: "User", default: null },
  },
  { timestamps: true },
);

const User: Model<IUser> =
  (mongoose.models.User as Model<IUser>) ||
  mongoose.model<IUser>("User", UserSchema);

export default User;