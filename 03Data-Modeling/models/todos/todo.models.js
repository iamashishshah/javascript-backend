import mongoose, { mongo } from 'mongoose';

const todoSchema = new mongoose.Schema(
  {
    content: {
      type: String,
      required: true,
      unique: true,
    },
    isComplete: {
      type: Boolean,
      default: false,
    },
    createdBy: {
      // now we want name of user, so we need some special type of data
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    subTodo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SubTodo',
      },
    ],
  },
  { timestamps: true }
);

export const Todo = mongoose.model('Todo', todoSchema);
