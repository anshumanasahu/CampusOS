import asyncHandler from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import * as focusService from '../services/focus.service.js';

export const getRecommendation = asyncHandler(async (req, res) => {
  const data = await focusService.getRecommendation(req.user._id);
  sendSuccess(res, data);
});

export const getHistory = asyncHandler(async (req, res) => {
  const data = await focusService.getHistory(req.user._id, req.query);
  sendSuccess(res, data);
});

export const getPlaylists = asyncHandler(async (req, res) => {
  const data = focusService.getPlaylists();
  sendSuccess(res, data);
});
