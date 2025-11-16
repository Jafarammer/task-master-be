import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  refreshToken?: string;
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
