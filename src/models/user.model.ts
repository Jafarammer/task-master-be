import { Schema, model, Document, Types } from "mongoose";

export interface IUser extends Document {
  _id: Types.ObjectId;
  full_name: string;
  email: string;
  pending_mail?: string | null;
  password: string;
  is_active: boolean;
  activationCode?: string | null;
  profile_picture?: string | null;
  reset_password_token?: string | null;
  reset_password_expired?: Date | null;
  refreshToken?: string | null;
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
      default: null,
    },
    profile_picture: { type: String, default: null },
    reset_password_token: { type: String, default: null },
    reset_password_expired: { type: Date, default: null },
  },
  { timestamps: true },
);

export default model<IUser>("User", userSchema);
