import mongoose from 'mongoose';

const sourceSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      required: true,
    },
    id: {
      type: String,
      default: null,
    },
    label: {
      type: String,
      required: true,
    },
  },
  { _id: false }
);

const chatSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'ChatThread',
      default: null,
      index: true,
    },
    role: {
      type: String,
      required: [true, 'Role is required'],
      enum: ['user', 'assistant', 'system'],
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      maxlength: 10000,
    },
    sources: {
      type: [sourceSchema],
      default: [],
    },
    dataNotFound: {
      type: Boolean,
      default: false,
    },
    contextModules: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

chatSessionSchema.index({ userId: 1, createdAt: -1 });
chatSessionSchema.index({ sessionId: 1, createdAt: 1 });

const ChatSession = mongoose.model('ChatSession', chatSessionSchema);
export default ChatSession;
