import asyncHandler from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import * as profileService from '../services/profile.service.js';

export const getProfile = asyncHandler(async (req, res) => {
  const data = await profileService.getProfile(req.user._id);
  sendSuccess(res, data);
});

export const updatePreferences = asyncHandler(async (req, res) => {
  const data = await profileService.updatePreferences(req.user._id, req.body);
  sendSuccess(res, data);
});

export const resetDemo = asyncHandler(async (req, res) => {
  const data = await profileService.resetDemo(req.user._id);
  sendSuccess(res, data);
});
