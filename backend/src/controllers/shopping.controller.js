import asyncHandler from '../utils/async-handler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import * as shoppingService from '../services/shopping.service.js';

export const getItems = asyncHandler(async (req, res) => {
  const data = await shoppingService.getItems(req.user._id, req.query);
  sendSuccess(res, data);
});

export const getSummary = asyncHandler(async (req, res) => {
  const data = await shoppingService.getSummary(req.user._id);
  sendSuccess(res, data);
});

export const addItem = asyncHandler(async (req, res) => {
  const data = await shoppingService.addItem(req.user._id, req.body);
  sendCreated(res, data);
});

export const addBulkItems = asyncHandler(async (req, res) => {
  const data = await shoppingService.addBulkItems(req.user._id, req.body.items);
  sendCreated(res, data);
});

export const markPurchased = asyncHandler(async (req, res) => {
  const data = await shoppingService.markPurchased(req.user._id, req.params.id);
  sendSuccess(res, data);
});

export const deleteItem = asyncHandler(async (req, res) => {
  const data = await shoppingService.deleteItem(req.user._id, req.params.id);
  sendSuccess(res, data);
});
