import mongoose from 'mongoose';

const burnoutRecordSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    mood: {
      type: Number,
      required: [true, 'Mood is required'],
      min: 1,
      max: 5,
    },
    sleepHours: {
      type: Number,
      required: [true, 'Sleep hours is required'],
      min: 0,
      max: 24,
    },
    workloadEstimate: {
      type: Number,
      required: [true, 'Workload estimate is required'],
      min: 1,
      max: 5,
    },
    pendingTasksCount: {
      type: Number,
      default: null,
      min: 0,
    },
    lateNightSpending: {
      type: Boolean,
      default: null,
    },
    score: {
      type: Number,
      default: null,
      min: 0,
      max: 100,
    },
    level: {
      type: String,
      default: null,
      enum: ['low', 'medium', 'high', null],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

burnoutRecordSchema.index({ userId: 1, date: -1 });

const BurnoutRecord = mongoose.model('BurnoutRecord', burnoutRecordSchema);
export default BurnoutRecord;
