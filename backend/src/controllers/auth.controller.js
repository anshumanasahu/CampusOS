import asyncHandler from '../utils/async-handler.js';
import { sendSuccess, sendCreated } from '../utils/response.js';
import * as authService from '../services/auth.service.js';

export const googleLogin = asyncHandler(async (req, res) => {
  const { credential } = req.body;
  const result = await authService.googleLogin(credential);
  sendSuccess(res, result);
});

export const demoLogin = asyncHandler(async (req, res) => {
  const result = await authService.demoLogin();
  sendSuccess(res, result);
});

export const getMe = asyncHandler(async (req, res) => {
  const user = await authService.getMe(req.user._id);
  sendSuccess(res, { user });
});

export const logout = asyncHandler(async (req, res) => {
  // JWT is stateless — client removes token.
  sendSuccess(res, { message: 'Logged out successfully' });
});
