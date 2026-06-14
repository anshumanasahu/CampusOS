import asyncHandler from '../utils/async-handler.js';
import { sendSuccess, sendMessage } from '../utils/response.js';
import * as chatbotService from '../services/chatbot.service.js';

export const sendChatMessage = asyncHandler(async (req, res) => {
  const data = await chatbotService.sendMessage(req.user._id, req.body);
  sendSuccess(res, data);
});

export const getHistory = asyncHandler(async (req, res) => {
  const data = await chatbotService.getHistory(req.user._id, req.query);
  sendSuccess(res, data);
});

export const clearHistory = asyncHandler(async (req, res) => {
  const data = await chatbotService.clearHistory(req.user._id);
  sendSuccess(res, data);
});
