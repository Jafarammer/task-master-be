import { Schema, model, Document, Types } from "mongoose";

export type TaskPriority = "low" | "medium" | "high";

export interface ITask extends Document {
  user_id: Types.ObjectId;

  title: string;

  description: string;

  due_date: Date;

  priority: TaskPriority;

  is_completed: boolean;

  deleted_at: Date | null;

  createdAt: Date;

  updatedAt: Date;
}

const taskSchema = new Schema<ITask>(
  {
    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    title: {
      type: String,
      required: true,
    },

    description: {
      type: String,
      required: true,
    },

    due_date: {
      type: Date,
      required: true,
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },

    is_completed: {
      type: Boolean,
      default: false,
    },

    deleted_at: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  },
);

export default model<ITask>("Task", taskSchema);
