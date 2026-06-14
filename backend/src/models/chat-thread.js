import mongoose from 'mongoose';

const chatThreadSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: 'New Chat',
      trim: true,
      maxlength: 100,
    },
    lastMessage: {
      type: String,
      default: null,
      maxlength: 200,
    },
    totalMessages: {
      type: Number,
      default: 0,
      min: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

chatThreadSchema.index({ userId: 1, updatedAt: -1 });

const ChatThread = mongoose.model('ChatThread', chatThreadSchema);
export default ChatThread;
