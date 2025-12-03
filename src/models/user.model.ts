import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  is_active: boolean;
  activationCode: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    first_name: { type: String, required: true },
    last_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    refreshToken: { type: String, default: null },
    is_active: {
      type: Boolean,
      default: false,
    },
    activationCode: {
      type: String,
    },
  },
  { timestamps: true }
);

export default model<IUser>("User", userSchema);
