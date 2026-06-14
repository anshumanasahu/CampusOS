import mongoose from 'mongoose';

const shoppingItemSchema = new mongoose.Schema(
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
    category: {
      type: String,
      default: 'general',
      enum: ['academics', 'lab', 'hostel', 'stationery', 'electronics', 'books', 'general'],
    },
    source: {
      type: String,
      default: 'manual',
      enum: ['manual', 'ai_detected', 'chatbot'],
    },
    reason: {
      type: String,
      default: null,
      maxlength: 300,
    },
    priority: {
      type: String,
      default: 'medium',
      enum: ['high', 'medium', 'low'],
    },
    estimatedCost: {
      type: Number,
      default: null,
      min: 0,
    },
    purchased: {
      type: Boolean,
      default: false,
    },
    amazonSearchUrl: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

shoppingItemSchema.index({ userId: 1, purchased: 1, priority: -1 });

const ShoppingItem = mongoose.model('ShoppingItem', shoppingItemSchema);
export default ShoppingItem;
