import asyncHandler from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import * as burnoutService from '../services/burnout.service.js';

export const getLatest = asyncHandler(async (req, res) => {
  const data = await burnoutService.getLatest(req.user._id);
  sendSuccess(res, data);
});

export const getHistory = asyncHandler(async (req, res) => {
  const data = await burnoutService.getHistory(req.user._id, req.query);
  sendSuccess(res, data);
});

export const checkin = asyncHandler(async (req, res) => {
  const data = await burnoutService.checkin(req.user._id, req.body);
  sendSuccess(res, data);
});
