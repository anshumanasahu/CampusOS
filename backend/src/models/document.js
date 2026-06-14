import mongoose from 'mongoose';

const documentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    fileName: {
      type: String,
      required: [true, 'File name is required'],
      trim: true,
    },
    fileKey: {
      type: String,
      required: [true, 'File key is required'],
    },
    fileType: {
      type: String,
      required: [true, 'File type is required'],
    },
    fileSize: {
      type: Number,
      required: [true, 'File size is required'],
      min: 1,
    },
    category: {
      type: String,
      default: null,
      enum: [
        'assignment',
        'exam',
        'placement',
        'club_event',
        'attendance',
        'scholarship',
        'hostel_notice',
        'fee_payment',
        'transport',
        'personal_reminder',
        'other',
        null,
      ],
    },
    extractedData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    possibleInfo: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    status: {
      type: String,
      required: true,
      enum: ['uploaded', 'extracting', 'review', 'confirmed', 'rejected', 'failed'],
      default: 'uploaded',
    },
    source: {
      type: String,
      required: true,
      enum: ['upload', 'manual'],
      default: 'upload',
    },
    manualData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

documentSchema.index({ userId: 1, category: 1 });
documentSchema.index({ userId: 1, status: 1 });

const Document = mongoose.model('Document', documentSchema);
export default Document;
