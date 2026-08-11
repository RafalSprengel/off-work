import mongoose from "mongoose";
import "@/db/models";
import Organization from "./models/Organization";


const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "Please define the MONGODB_URI environment variable inside .env.local"
  );
}

const mongoUri: string = MONGODB_URI;
const DEFAULT_ORG_ID = "000000000000000000000001";

let cached = (global as any).mongoose;

if (!cached) {
  cached = (global as any).mongoose = { conn: null, promise: null };
}

async function dbConnect() {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = { bufferCommands: false };
    cached.promise = mongoose.connect(mongoUri, opts).then((m) => m.connection);
  }

  try {
    cached.conn = await cached.promise;
  } catch (e) {
    cached.promise = null;
    throw e;
  }


  const existing = await Organization.findById(DEFAULT_ORG_ID).lean();
  if (!existing) {
    await Organization.create({
      _id: new mongoose.Types.ObjectId(DEFAULT_ORG_ID),
      name: "Default Organization",
      slug: "default",
    });
  }

  return cached.conn;
}

export default dbConnect;