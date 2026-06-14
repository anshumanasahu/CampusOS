import mongoose from 'mongoose';

const contributionSchema = new mongoose.Schema(
  {
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'KnowledgeResource',
      required: true,
    },
    type: {
      type: String,
      required: true,
      enum: ['notes', 'pyq', 'professor_review'],
    },
    pointsEarned: {
      type: Number,
      required: true,
      default: 1,
    },
    date: {
      type: Date,
      required: true,
      default: Date.now,
    },
  },
  { _id: false }
);

const goodSeniorPointsSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    totalPoints: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
    contributions: {
      type: [contributionSchema],
      default: [],
    },
  },
  {
    timestamps: { createdAt: false, updatedAt: true },
  }
);

const GoodSeniorPoints = mongoose.model('GoodSeniorPoints', goodSeniorPointsSchema);
export default GoodSeniorPoints;
