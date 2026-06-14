import mongoose from 'mongoose';

const knowledgeResourceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    type: {
      type: String,
      required: [true, 'Resource type is required'],
      enum: ['notes', 'pyq', 'professor_review'],
    },
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      maxlength: 300,
    },
    subject: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      default: null,
      trim: true,
      maxlength: 2000,
    },
    fileKey: {
      type: String,
      default: null,
    },
    content: {
      type: String,
      default: null,
      maxlength: 10000,
    },
    rating: {
      type: Number,
      default: null,
      min: 1,
      max: 5,
    },
  },
  {
    timestamps: true,
  }
);

knowledgeResourceSchema.index({ type: 1, subject: 1 });
knowledgeResourceSchema.index({ title: 'text', description: 'text' });

const KnowledgeResource = mongoose.model('KnowledgeResource', knowledgeResourceSchema);
export default KnowledgeResource;
