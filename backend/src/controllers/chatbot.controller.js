import asyncHandler from '../utils/async-handler.js';
import { sendSuccess } from '../utils/response.js';
import * as chatbotService from '../services/chatbot.service.js';

// ═══ Messaging (backward compatible) ═══

export const sendChatMessage = asyncHandler(async (req, res) => {
  const data = await chatbotService.sendMessage(req.user._id, req.body);
  sendSuccess(res, data);
});

export const getHistory = asyncHandler(async (req, res) => {
  const data = await chatbotService.getHistory(req.user._id, req.query);
  sendSuccess(res, data);
});

export const clearHistory = asyncHandler(async (req, res) => {
  const data = await chatbotService.clearHistory(req.user._id, req.body);
  sendSuccess(res, data);
});

// ═══ Session management (new) ═══

export const listThreads = asyncHandler(async (req, res) => {
  const data = await chatbotService.listThreads(req.user._id);
  sendSuccess(res, data);
});

export const createThread = asyncHandler(async (req, res) => {
  const data = await chatbotService.createThread(req.user._id, req.body);
  sendSuccess(res, data);
});

export const renameThread = asyncHandler(async (req, res) => {
  const data = await chatbotService.renameThread(req.user._id, req.params.id, req.body);
  sendSuccess(res, data);
});

export const deleteThread = asyncHandler(async (req, res) => {
  const data = await chatbotService.deleteThread(req.user._id, req.params.id);
  sendSuccess(res, data);
});
