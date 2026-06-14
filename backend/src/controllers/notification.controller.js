import asyncHandler from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import * as notificationService from '../services/notification.service.js';

export const getNotifications = asyncHandler(async (req, res) => {
  const data = await notificationService.getNotifications(req.user._id, req.query);
  sendSuccess(res, data);
});

export const dismissNotification = asyncHandler(async (req, res) => {
  const data = await notificationService.dismissNotification(req.user._id, req.params.id);
  sendSuccess(res, data);
});

export const dismissAll = asyncHandler(async (req, res) => {
  const data = await notificationService.dismissAll(req.user._id);
  sendSuccess(res, data);
});

export const deleteNotification = asyncHandler(async (req, res) => {
  const data = await notificationService.deleteNotification(req.user._id, req.params.id);
  sendSuccess(res, data);
});

export const clearViewed = asyncHandler(async (req, res) => {
  const data = await notificationService.clearViewed(req.user._id);
  sendSuccess(res, data);
});
