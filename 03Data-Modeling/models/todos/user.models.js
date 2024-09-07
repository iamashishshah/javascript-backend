import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: {
      type: String,
      required: true,
      unique: true,
      min: [6, 'min 6 characters required for password'],
      max: [12, 'max 12 characters allowed. Thank you!'],
    },
  },
  { timestamps: true }
);

export const User = mongoose.model('User', userSchema);
