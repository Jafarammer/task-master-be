import { Schema, model, Document } from "mongoose";

export interface ITask extends Document {
  user_id: object;
  title: string;
  description: string;
  due_date: Date;
  priority: string;
  is_completed: boolean;
  deleted_at: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user_id: { type: Schema.Types.ObjectId, ref: "User", required: true },
    title: { type: String, required: true },
    description: { type: String, required: true },
    due_date: { type: Date, required: true },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    is_completed: { type: Boolean, default: false },
    deleted_at: { type: Date, default: null },
  },
  { timestamps: true }
);

export default model<ITask>("Task", taskSchema);
