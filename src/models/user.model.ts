import { Schema, model, Document } from "mongoose";

export interface IUser extends Document {
  full_name: string;
  email: string;
  pending_mail?: string;
  password: string;
  is_active: boolean;
  activationCode: string;
  refreshToken?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>(
  {
    full_name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    pending_mail: { type: String, default: null },
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
  { timestamps: true },
);

export default model<IUser>("User", userSchema);
