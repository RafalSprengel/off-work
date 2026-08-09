import mongoose, { type Document, type Model, Schema } from "mongoose";

export interface IOrganization extends Document {
    name: string;
    slug?: string;
    createdAt: Date;
    updatedAt: Date;
}

const OrganizationSchema = new Schema<IOrganization>(
    {
        name: {
            type: String,
            required: [true, "Organization name is required"],
            trim: true,
        },
        slug: {
            type: String,
            trim: true,
            lowercase: true,
        },
    },
    { timestamps: true }
);

OrganizationSchema.index({ slug: 1 }, { unique: true, sparse: true });

const Organization: Model<IOrganization> =
    (mongoose.models.Organization as Model<IOrganization>) ||
    mongoose.model<IOrganization>("Organization", OrganizationSchema);

export default Organization;