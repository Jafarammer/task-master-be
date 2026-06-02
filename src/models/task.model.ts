import { Schema, model, Document, Types } from "mongoose";

export type TaskPriority = "low" | "medium" | "high";

export interface ITask extends Document {
  user_id: Types.ObjectId;
  title: string;
  description: string;
  start_date: Date | null;
  end_date: Date | null;
  due_date: Date | null;
  priority: TaskPriority;
  is_completed: boolean;
  deleted_at: Date | null;
  size: number;
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

    start_date: { type: Date, default: null },
    end_date: { type: Date, default: null },

    due_date: {
      type: Date,
      default: null,
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

    size: {
      type: Number,
      required: true,
      default: 0,
    },
  },
  {
    timestamps: true,
  },
);

export default model<ITask>("Task", taskSchema);
