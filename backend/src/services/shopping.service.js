import ShoppingItem from '../models/shopping-item.js';
import Expense from '../models/expense.js';
import ExpenseBudget from '../models/expense-budget.js';
import AppError from '../utils/app-error.js';
import { validateRequired, validateEnum, validateObjectId } from '../utils/validators.js';
import { getCurrentMonth, getMonthRange } from '../utils/date.js';

const VALID_CATEGORIES = ['academics', 'lab', 'hostel', 'stationery', 'electronics', 'books', 'general'];
const VALID_PRIORITIES = ['high', 'medium', 'low'];

/**
 * Generate Amazon search URL for a product.
 */
const generateAmazonUrl = (title) => {
  return `https://www.amazon.in/s?k=${encodeURIComponent(title)}`;
};

/**
 * Get all shopping items for user.
 */
export const getItems = async (userId, filters = {}) => {
  const query = { userId };
  if (filters.purchased === 'true') query.purchased = true;
  else if (filters.purchased === 'false') query.purchased = false;
  if (filters.priority) query.priority = filters.priority;
  if (filters.category) query.category = filters.category;

  const items = await ShoppingItem.find(query)
    .sort({ priority: -1, createdAt: -1 })
    .lean();

  return { items };
};

/**
 * Get shopping summary with budget context.
 */
export const getSummary = async (userId) => {
  const items = await ShoppingItem.find({ userId, purchased: false }).lean();
  const month = getCurrentMonth();
  const { start, end } = getMonthRange(month);

  const [expenses, budgets] = await Promise.all([
    Expense.find({ userId, date: { $gte: start, $lte: end } }).lean(),
    ExpenseBudget.find({ userId, month }).lean(),
  ]);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const totalBudget = budgets.reduce((s, b) => s + b.limit, 0);
  const remaining = Math.max(0, totalBudget - totalSpent);
  const estimatedShoppingCost = items.reduce((s, i) => s + (i.estimatedCost || 0), 0);

  const highPriority = items.filter((i) => i.priority === 'high');
  const mediumPriority = items.filter((i) => i.priority === 'medium');

  return {
    totalItems: items.length,
    highPriorityCount: highPriority.length,
    estimatedCost: estimatedShoppingCost,
    budgetRemaining: remaining,
    canAfford: remaining >= estimatedShoppingCost,
    highPriority: highPriority.slice(0, 5),
    mediumPriority: mediumPriority.slice(0, 5),
  };
};

/**
 * Add a shopping item.
 */
export const addItem = async (userId, data) => {
  validateRequired(data, ['title']);
  if (data.category) validateEnum(data.category, VALID_CATEGORIES, 'category');
  if (data.priority) validateEnum(data.priority, VALID_PRIORITIES, 'priority');

  const item = await ShoppingItem.create({
    userId,
    title: data.title,
    category: data.category || 'general',
    source: data.source || 'manual',
    reason: data.reason || null,
    priority: data.priority || 'medium',
    estimatedCost: data.estimatedCost ? Number(data.estimatedCost) : null,
    purchased: false,
    amazonSearchUrl: generateAmazonUrl(data.searchQuery || data.title),
  });

  return { item };
};

/**
 * Add multiple items (from AI detection).
 */
export const addBulkItems = async (userId, items) => {
  if (!Array.isArray(items) || items.length === 0) return { items: [] };

  const created = [];
  for (const data of items.slice(0, 20)) {
    if (!data.title) continue;
    const item = await ShoppingItem.create({
      userId,
      title: data.title,
      category: data.category || 'general',
      source: data.source || 'ai_detected',
      reason: data.reason || null,
      priority: data.priority || 'medium',
      estimatedCost: data.estimatedCost || null,
      purchased: false,
      amazonSearchUrl: generateAmazonUrl(data.searchQuery || data.title),
    });
    created.push(item);
  }

  return { items: created };
};

/**
 * Mark item as purchased.
 */
export const markPurchased = async (userId, itemId) => {
  validateObjectId(itemId);
  const item = await ShoppingItem.findOne({ _id: itemId, userId });
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');
  item.purchased = true;
  await item.save();
  return { item };
};

/**
 * Delete an item.
 */
export const deleteItem = async (userId, itemId) => {
  validateObjectId(itemId);
  const item = await ShoppingItem.findOneAndDelete({ _id: itemId, userId });
  if (!item) throw new AppError('Item not found', 404, 'NOT_FOUND');
  return { message: 'Item deleted' };
};
