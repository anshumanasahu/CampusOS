import mongoose from 'mongoose';

const notificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 200,
    },
    message: {
      type: String,
      required: [true, 'Message is required'],
      trim: true,
      maxlength: 500,
    },
    type: {
      type: String,
      required: [true, 'Type is required'],
      enum: ['deadline', 'attendance', 'budget', 'burnout', 'knowledge', 'general'],
    },
    priority: {
      type: String,
      required: true,
      enum: ['urgent', 'normal', 'low'],
      default: 'normal',
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    relatedEntity: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

notificationSchema.index({ userId: 1, isRead: 1, priority: -1, createdAt: -1 });

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
