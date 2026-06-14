import mongoose from 'mongoose';

const expenseBudgetSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: ['food', 'travel', 'academics', 'shopping', 'entertainment', 'hostel', 'medical', 'bills', 'other'],
    },
    limit: {
      type: Number,
      required: [true, 'Budget limit is required'],
      min: [1, 'Limit must be at least 1'],
    },
    month: {
      type: String,
      required: [true, 'Month is required'],
      match: [/^\d{4}-(0[1-9]|1[0-2])$/, 'Month must be in YYYY-MM format'],
    },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

expenseBudgetSchema.index({ userId: 1, category: 1, month: 1 }, { unique: true });

const ExpenseBudget = mongoose.model('ExpenseBudget', expenseBudgetSchema);
export default ExpenseBudget;
