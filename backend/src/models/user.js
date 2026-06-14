import mongoose from 'mongoose';

const userSchema = new mongoose.Schema(
  {
    googleId: {
      type: String,
      unique: true,
      sparse: true,
      default: null,
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
    },
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: 100,
    },
    avatar: {
      type: String,
      default: null,
    },
    college: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },
    semester: {
      type: Number,
      default: null,
      min: 1,
      max: 12,
    },
    branch: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    isDemo: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const User = mongoose.model('User', userSchema);
export default User;
