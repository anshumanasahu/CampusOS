import mongoose from 'mongoose';

const focusSessionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    burnoutLevel: {
      type: String,
      enum: ['low', 'medium', 'high'],
      default: 'low',
    },
    workload: {
      type: Number,
      default: 0,
      min: 0,
      max: 10,
    },
    sleepScore: {
      type: Number,
      default: null,
    },
    mood: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
    recommendation: {
      type: String,
      required: true,
      maxlength: 500,
    },
    playlistType: {
      type: String,
      required: true,
      enum: ['deep_focus', 'light_focus', 'relaxation', 'recovery', 'coding_focus', 'morning_energy'],
    },
    duration: {
      type: Number,
      default: 90,
    },
    reason: {
      type: String,
      default: null,
      maxlength: 300,
    },
  },
  {
    timestamps: { createdAt: 'generatedAt', updatedAt: false },
  }
);

focusSessionSchema.index({ userId: 1, generatedAt: -1 });

const FocusSession = mongoose.model('FocusSession', focusSessionSchema);
export default FocusSession;
