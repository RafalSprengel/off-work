import mongoose, { Schema, Document, Model } from "mongoose";

export interface IUser extends Document {
    firstName: string;
    lastName: string;
    email: string;
    department: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
    {
        firstName: { type: String, required: true },
        lastName: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        department: { type: String, required: true },
        role: { type: String, default: 'Employee', required: true },
    },
    { timestamps: true }
);

const User: Model<IUser> =
    (mongoose.models.User as Model<IUser>) ||
    mongoose.model<IUser>('User', UserSchema);

export default User;