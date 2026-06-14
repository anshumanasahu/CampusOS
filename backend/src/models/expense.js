import mongoose from 'mongoose';

const expenseSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0.01, 'Amount must be positive'],
    },
    date: {
      type: Date,
      required: [true, 'Date is required'],
    },
    merchant: {
      type: String,
      default: null,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      trim: true,
      maxlength: 500,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['food', 'travel', 'academics', 'shopping', 'entertainment', 'hostel', 'medical', 'bills', 'other'],
    },
    paymentMode: {
      type: String,
      enum: ['cash', 'upi', 'card', 'bank_transfer', 'other'],
      default: 'cash',
    },
    upiRef: {
      type: String,
      default: null,
      trim: true,
      maxlength: 100,
    },
    recurring: {
      type: Boolean,
      default: false,
    },
    source: {
      type: String,
      enum: ['manual', 'bank_statement'],
      default: 'manual',
    },
    aiCategorized: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

expenseSchema.index({ userId: 1, date: -1 });
expenseSchema.index({ userId: 1, category: 1, date: -1 });

const Expense = mongoose.model('Expense', expenseSchema);
export default Expense;
